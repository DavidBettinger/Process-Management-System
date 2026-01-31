import { Pipe, PipeTransform } from '@angular/core';
import { LabelResolverService } from './label-resolver.service';

@Pipe({
  name: 'taskLabel',
  standalone: true,
  pure: false
})
export class TaskLabelPipe implements PipeTransform {
  constructor(private readonly resolver: LabelResolverService) {}

  transform(taskId?: string | null): string {
    return this.resolver.taskLabel(taskId);
  }
}
