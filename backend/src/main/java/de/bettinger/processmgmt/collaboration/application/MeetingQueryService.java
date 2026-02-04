package de.bettinger.processmgmt.collaboration.application;

import de.bettinger.processmgmt.collaboration.infrastructure.persistence.MeetingEntity;
import de.bettinger.processmgmt.collaboration.infrastructure.persistence.MeetingRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class MeetingQueryService {

	private final MeetingRepository meetingRepository;

	public MeetingQueryService(MeetingRepository meetingRepository) {
		this.meetingRepository = meetingRepository;
	}

	public List<MeetingEntity> listMeetings(UUID caseId) {
		return meetingRepository.findAllByCaseIdOrderByScheduledAtDesc(caseId);
	}
}
