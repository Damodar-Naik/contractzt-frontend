import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuditDiffModalComponent } from '../audit-diff-modal/audit-diff-modal.component';

@Component({
  selector: 'app-contract-detail',
  standalone: true,
  imports: [DatePipe, FormsModule, AuditDiffModalComponent],
  templateUrl: './contract-detail.component.html'
})
export class ContractDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  authService = inject(AuthService);

  contract = signal<any>(null);
  isUpdating = signal(false);
  isEditing = signal(false);
  editableDescription = signal('');
  selectedAuditLog = signal<any | null>(null);
  diffModalTitle = signal('Compare Changes');
  diffModalOriginalCode = signal('{}');
  diffModalModifiedCode = signal('{}');
  errorMessage = signal('');
  successMessage = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadDetail(id);
  }

  loadDetail(id: string) {
    this.api.get<any>(API_ENDPOINTS.CONTRACTS.DETAIL(id)).subscribe(res => {
      this.contract.set(res);
      this.editableDescription.set(res.description ?? '');
    });
  }

  canSubmitForReview(): boolean {
    return this.authService.user()?.role !== 'viewer' && this.contract()?.status === 'draft';
  }

  canReview(): boolean {
    const role = this.authService.user()?.role;
    return (role === 'admin' || role === 'bu') && this.contract()?.status === 'pending_review';
  }

  canEditContract(): boolean {
    const role = this.authService.user()?.role;
    const status = this.contract()?.status;
    return (role === 'admin' || role === 'bu') && ['draft', 'pending_review'].includes(status);
  }

  statusBadgeClass(status: string): string {
    switch (status) {
      case 'draft':
        return 'bg-slate-500/20 text-slate-200 ring-1 ring-inset ring-slate-400/30';
      case 'pending_review':
        return 'bg-amber-500/20 text-amber-200 ring-1 ring-inset ring-amber-400/30';
      case 'approved':
        return 'bg-emerald-500/20 text-emerald-200 ring-1 ring-inset ring-emerald-400/30';
      case 'rejected':
        return 'bg-rose-500/20 text-rose-200 ring-1 ring-inset ring-rose-400/30';
      default:
        return 'bg-gray-500/20 text-gray-200 ring-1 ring-inset ring-gray-400/30';
    }
  }

  showStatusLockedMessage(): boolean {
    if (!this.contract()) return false;

    const role = this.authService.user()?.role;
    return role === 'viewer' || ['approved', 'rejected'].includes(this.contract().status);
  }

  startEditing() {
    const currentContract = this.contract();
    if (!currentContract || !this.canEditContract()) return;

    this.errorMessage.set('');
    this.successMessage.set('');
    this.editableDescription.set(currentContract.description ?? '');
    this.isEditing.set(true);
  }

  cancelEditing() {
    this.editableDescription.set(this.contract()?.description ?? '');
    this.isEditing.set(false);
    this.errorMessage.set('');
  }

  canCompareChanges(log: any): boolean {
    return log?.action === 'CONTRACT_UPDATED' && (!!log.old_value || !!log.new_value);
  }

  openDiffModal(log: any) {
    if (!this.canCompareChanges(log)) return;

    this.diffModalTitle.set(`Compare Changes - ${log.action}`);
    this.diffModalOriginalCode.set(this.formatAuditValue(log.old_value));
    this.diffModalModifiedCode.set(this.formatAuditValue(log.new_value));
    this.selectedAuditLog.set(log);
  }

  closeDiffModal() {
    this.selectedAuditLog.set(null);
    this.diffModalTitle.set('Compare Changes');
    this.diffModalOriginalCode.set('{}');
    this.diffModalModifiedCode.set('{}');
  }

  saveContract() {
    const currentContract = this.contract();
    if (!currentContract || !this.canEditContract()) return;

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isUpdating.set(true);

    this.api.patch(API_ENDPOINTS.CONTRACTS.UPDATE(currentContract.id), {
      description: this.editableDescription().trim()
    })
      .pipe(finalize(() => this.isUpdating.set(false)))
      .subscribe({
        next: (res: any) => {
          this.isEditing.set(false);
          this.successMessage.set(res.message || 'Contract updated successfully.');
          this.loadDetail(currentContract.id);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.error || 'Failed to update contract.');
        }
      });
  }

  updateStatus(newStatus: 'pending_review' | 'approved' | 'rejected') {
    const currentContract = this.contract();
    if (!currentContract) return;

    if (newStatus === 'rejected' && !window.confirm('Reject this contract?')) {
      return;
    }

    if (newStatus === 'approved' && !window.confirm('Approve this contract?')) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isUpdating.set(true);

    this.api.patch(API_ENDPOINTS.CONTRACTS.UPDATE_STATUS(currentContract.id), { status: newStatus })
      .pipe(finalize(() => this.isUpdating.set(false)))
      .subscribe({
        next: () => {
          this.successMessage.set('Contract status updated successfully.');
          this.loadDetail(currentContract.id);
        },
        error: (err) => {
          this.errorMessage.set(err.error?.error || 'Failed to update contract status.');
        }
      });
  }

  private formatAuditValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'string') {
      try {
        return this.toReadableAuditText(JSON.parse(value));
      } catch {
        return value.replace(/\\n/g, '\n');
      }
    }

    try {
      return this.toReadableAuditText(value);
    } catch {
      return String(value).replace(/\\n/g, '\n');
    }
  }

  private toReadableAuditText(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (typeof value === 'string') {
      return value.replace(/\\n/g, '\n');
    }

    if (typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const keys = Object.keys(record);

      if (keys.length === 1) {
        return this.toReadableAuditText(record[keys[0]]);
      }

      return keys
        .map((key) => `${this.toLabel(key)}:\n${this.toReadableAuditText(record[key])}`)
        .join('\n\n');
    }

    return String(value);
  }

  private toLabel(value: string): string {
    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
}
