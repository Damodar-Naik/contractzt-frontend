import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './contract-list.component.html'
})
export class ContractListComponent implements OnInit {
  private api = inject(ApiService);
  authService = inject(AuthService);

  contracts = signal<any[]>([]);
  totalItems = signal(0);
  currentPage = signal(1);
  activeContractId = signal<string | null>(null);
  errorMessage = signal('');
  pageSize = 10;

  ngOnInit() {
    this.loadContracts();
  }

  loadContracts() {
    const endpoint = `${API_ENDPOINTS.CONTRACTS.LIST}?page=${this.currentPage()}&limit=${this.pageSize}`;
    this.api.get<any>(endpoint).subscribe(res => {
      this.contracts.set(res);
      // this.totalItems.set(res.meta.total_items);
    });
  }

  changePage(page: number) {
    this.currentPage.set(page);
    this.loadContracts();
  }

  canSubmitForReview(contract: any): boolean {
    return this.authService.user()?.role !== 'viewer' && contract.status === 'draft';
  }

  canReview(contract: any): boolean {
    const role = this.authService.user()?.role;
    return (role === 'admin' || role === 'bu') && contract.status === 'pending_review';
  }

  isUpdating(contractId: string): boolean {
    return this.activeContractId() === contractId;
  }

  updateStatus(contractId: string, status: 'pending_review' | 'approved' | 'rejected') {
    const actionLabel = status.replace('_', ' ');

    if (status === 'rejected' && !window.confirm('Reject this contract?')) {
      return;
    }

    if (status === 'approved' && !window.confirm('Approve this contract?')) {
      return;
    }

    this.errorMessage.set('');
    this.activeContractId.set(contractId);

    this.api.patch(API_ENDPOINTS.CONTRACTS.UPDATE_STATUS(contractId), { status })
      .pipe(finalize(() => this.activeContractId.set(null)))
      .subscribe({
        next: () => this.loadContracts(),
        error: (err) => {
          this.errorMessage.set(err.error?.error || `Failed to ${actionLabel} contract.`);
        }
      });
  }
}
