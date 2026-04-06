import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'salaryCad', standalone: true })
export class SalaryCadPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value == null || Number.isNaN(value)) return '—';
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(value);
  }
}
