import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

type DiffEditorModel = {
  code: string;
  language: string;
};

@Component({
  selector: 'app-audit-diff-modal',
  standalone: true,
  imports: [MonacoEditorModule],
  templateUrl: './audit-diff-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuditDiffModalComponent implements OnChanges {
  @Input() visible = false;
  @Input() title = 'Compare Changes';
  @Input() originalCode = '';
  @Input() modifiedCode = '';

  @Output() closed = new EventEmitter<void>();

  readonly diffOptions = {
    theme: 'vs-dark',
    readOnly: true,
    renderSideBySide: true,
    automaticLayout: true,
    minimap: { enabled: false },
    wordWrap: 'on',
    fontSize: 13,
    lineNumbers: 'on'
  };

  originalModel: DiffEditorModel = {
    code: '',
    language: 'text'
  };

  modifiedModel: DiffEditorModel = {
    code: '',
    language: 'text'
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['originalCode']) {
      this.originalModel = {
        code: this.originalCode,
        language: 'text'
      };
    }

    if (changes['modifiedCode']) {
      this.modifiedModel = {
        code: this.modifiedCode,
        language: 'text'
      };
    }
  }

  close() {
    this.closed.emit();
  }
}
