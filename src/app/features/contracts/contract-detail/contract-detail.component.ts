import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';
import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-contract-detail',
  standalone: true,
  imports: [UpperCasePipe, DatePipe],
  templateUrl: './contract-detail.component.html'
})
export class ContractDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  authService = inject(AuthService);

  contract = signal<any>(null);
  isUpdating = signal(false);
  errorMessage = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadDetail(id);
  }

  loadDetail(id: string) {
    this.api.get<any>(API_ENDPOINTS.CONTRACTS.DETAIL(id)).subscribe(res => this.contract.set(res));
  }

  canSubmitForReview(): boolean {
    return this.authService.user()?.role !== 'viewer' && this.contract()?.status === 'draft';
  }

  canReview(): boolean {
    const role = this.authService.user()?.role;
    return (role === 'admin' || role === 'bu') && this.contract()?.status === 'pending_review';
  }

  showStatusLockedMessage(): boolean {
    if (!this.contract()) return false;

    const role = this.authService.user()?.role;
    return role === 'viewer' || ['approved', 'rejected'].includes(this.contract().status);
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
    this.isUpdating.set(true);

    this.api.patch(API_ENDPOINTS.CONTRACTS.UPDATE_STATUS(currentContract.id), { status: newStatus })
      .pipe(finalize(() => this.isUpdating.set(false)))
      .subscribe({
        next: () => this.loadDetail(currentContract.id),
        error: (err) => {
          this.errorMessage.set(err.error?.error || 'Failed to update contract status.');
        }
      });
  }
}
