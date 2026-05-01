import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints';

@Component({
  selector: 'app-contract-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div>
      <form [formGroup]="contractForm" (ngSubmit)="submit()" class="max-w-2xl mx-auto bg-gray-800 p-8 rounded shadow">
        <h2 class="text-white text-xl mb-6">Create New Contract</h2>
        
        <label class="text-gray-400 block mb-2">Title (Max 120 chars)</label>
        <input formControlName="title" class="w-full p-2 mb-4 bg-gray-700 text-white rounded border border-gray-600">
        
        <label class="text-gray-400 block mb-2">Description</label>
        <textarea formControlName="description" rows="4" class="w-full p-2 mb-6 bg-gray-700 text-white rounded border border-gray-600"></textarea>
        
        <div class="flex gap-4">
          <button type="submit" [disabled]="contractForm.invalid" class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50">
            Save Draft
          </button>
          <button type="button" routerLink="/contracts" class="text-gray-400">Cancel</button>
        </div>
      </form>
    </div>
  `
})
export class ContractFormComponent {
  private fb = inject(NonNullableFormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);

  contractForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['']
  });

  submit() {
    this.api.post(API_ENDPOINTS.CONTRACTS.LIST, this.contractForm.value).subscribe(() => {
      this.router.navigate(['/contracts']);
    });
  }
}