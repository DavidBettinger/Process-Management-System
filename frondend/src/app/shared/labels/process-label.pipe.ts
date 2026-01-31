import { Pipe, PipeTransform } from '@angular/core';
import { LabelResolverService } from './label-resolver.service';

@Pipe({
  name: 'processLabel',
  standalone: true,
  pure: false
})
export class ProcessLabelPipe implements PipeTransform {
  constructor(private readonly resolver: LabelResolverService) {}

  transform(caseId?: string | null): string {
    return this.resolver.processLabel(caseId);
  }
}
