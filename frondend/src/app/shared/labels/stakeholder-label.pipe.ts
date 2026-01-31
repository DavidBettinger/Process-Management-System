import { Pipe, PipeTransform } from '@angular/core';
import { LabelResolverService } from './label-resolver.service';

@Pipe({
  name: 'stakeholderLabel',
  standalone: true,
  pure: false
})
export class StakeholderLabelPipe implements PipeTransform {
  constructor(private readonly resolver: LabelResolverService) {}

  transform(stakeholderId?: string | null, roleOverride?: string | null): string {
    return this.resolver.stakeholderLabel(stakeholderId, roleOverride);
  }
}
