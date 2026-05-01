import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Added for search input
import { finalize, debounceTime, Subject, distinctUntilChanged } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';

@Component({
  selector: 'app-contract-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './contract-list.component.html'
})
export class ContractListComponent implements OnInit {
  private api = inject(ApiService);
  authService = inject(AuthService);

  contracts = signal<any[]>([]);
  totalItems = signal(0);
  totalPages = signal(0);
  currentPage = signal(1);
  pageSize = 10;

  // Search state
  searchQuery = signal('');
  private searchSubject = new Subject<string>();

  activeContractId = signal<string | null>(null);
  errorMessage = signal('');

  ngOnInit() {
    this.loadContracts();

    // Debounce search to avoid hitting the API on every keystroke
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1); // Reset to first page on new search
      this.loadContracts();
    });
  }

  onSearch(query: string) {
    this.searchSubject.next(query);
  }

  loadContracts() {
    let endpoint = `${API_ENDPOINTS.CONTRACTS.LIST}?page=${this.currentPage()}&limit=${this.pageSize}`;

    if (this.searchQuery()) {
      endpoint += `&title=${encodeURIComponent(this.searchQuery())}`;
    }

    this.api.get<any>(endpoint).subscribe({
      next: (res) => {
        // Updated to match your new backend response structure
        this.contracts.set(res.data);
        this.totalItems.set(res.pagination.total);
        this.totalPages.set(res.pagination.totalPages);
      },
      error: (err) => this.errorMessage.set('Failed to load contracts.')
    });
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadContracts();
    }
  }

  // ... (Keep canSubmitForReview, canReview, isUpdating, and updateStatus as they were)
  canSubmitForReview(contract: any): boolean {
    return this.authService.user()?.role !== 'viewer' && contract.status === 'draft';
  }

  canReview(contract: any): boolean {
    const role = this.authService.user()?.role;
    return (role === 'admin' || role === 'bu') && contract.status === 'pending_review';
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

  isUpdating(contractId: string): boolean {
    return this.activeContractId() === contractId;
  }

  updateStatus(contractId: string, status: 'pending_review' | 'approved' | 'rejected') {
    const actionLabel = status.replace('_', ' ');

    if (status === 'rejected' && !window.confirm('Reject this contract?')) return;
    if (status === 'approved' && !window.confirm('Approve this contract?')) return;

    this.errorMessage.set('');
    this.activeContractId.set(contractId);

    this.api.patch(API_ENDPOINTS.CONTRACTS.UPDATE_STATUS(contractId), { status })
      .pipe(finalize(() => this.activeContractId.set(null)))
      .subscribe({
        next: () => this.loadContracts(),
        error: (err) => this.errorMessage.set(err.error?.error || `Failed to ${actionLabel} contract.`)
      });
  }
}
