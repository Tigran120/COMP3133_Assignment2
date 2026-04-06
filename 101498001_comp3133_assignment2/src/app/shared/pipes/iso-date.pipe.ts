import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'isoDate', standalone: true })
export class IsoDatePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }
}
