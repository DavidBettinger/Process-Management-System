import { Pipe, PipeTransform } from '@angular/core';
import { LabelResolverService } from './label-resolver.service';

@Pipe({
  name: 'meetingLabel',
  standalone: true,
  pure: false
})
export class MeetingLabelPipe implements PipeTransform {
  constructor(private readonly resolver: LabelResolverService) {}

  transform(meetingId?: string | null, occurredAt?: string | null, locationId?: string | null): string {
    return this.resolver.meetingLabel(meetingId, occurredAt, locationId);
  }
}
