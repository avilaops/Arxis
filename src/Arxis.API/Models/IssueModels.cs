using System.Collections.Generic;
using Arxis.Domain.Entities;

namespace Arxis.API.Models;

public record IssueSummaryDto(
    Guid Id,
    Guid ProjectId,
    string ReferenceCode,
    string Title,
    IssueType Type,
    IssuePriority Priority,
    IssueStatus Status,
    bool IsRfi,
    bool IsBlocking,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    DateTime? DueDate,
    int? SlaMinutes,
    DateTime? ResponseDueDate,
    DateTime? RespondedAt,
    Guid? AssignedToUserId,
    string? AssignedToUserName,
    Guid? ReportedByUserId,
    string? ReportedByUserName,
    Guid? RespondedByUserId,
    string? RespondedByUserName,
    Guid? WorkTaskId,
    string? WorkTaskTitle,
    string? Location,
    string? Discipline
);

public record IssueDetailDto(
    IssueSummaryDto Summary,
    string? Description,
    string? Resolution,
    string? RfiQuestion,
    string? RfiAnswer,
    string? ExternalReference,
    IReadOnlyCollection<IssueAttachmentDto> Attachments,
    IReadOnlyCollection<IssueCommentDto> Comments,
    IReadOnlyCollection<IssueLinkDto> Links
);

public record IssueAttachmentDto(
    Guid Id,
    string FileName,
    string FileUrl,
    string ContentType,
    long FileSize,
    Guid? UploadedByUserId,
    string? UploadedByUserName,
    Guid? CommentId
);

public record IssueCommentDto(
    Guid Id,
    string Message,
    bool IsInternal,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    Guid? AuthorId,
    string? AuthorName,
    IReadOnlyCollection<IssueAttachmentDto> Attachments
);

public record IssueLinkDto(
    Guid Id,
    IssueLinkType LinkType,
    Guid? RelatedEntityId,
    string? ExternalReference,
    string? Label,
    string? Metadata
);

public record IssueCreateRequest(
    Guid ProjectId,
    string Title,
    string? Description,
    IssueType Type,
    IssuePriority Priority,
    bool IsRfi,
    bool IsBlocking,
    DateTime? DueDate,
    int? SlaMinutes,
    DateTime? ResponseDueDate,
    Guid? AssignedToUserId,
    Guid? ReportedByUserId,
    Guid? WorkTaskId,
    string? Location,
    string? Discipline,
    string? RfiQuestion,
    string? ExternalReference
);

public record IssueUpdateRequest(
    string Title,
    string? Description,
    IssueType Type,
    IssuePriority Priority,
    IssueStatus Status,
    bool IsBlocking,
    DateTime? DueDate,
    int? SlaMinutes,
    DateTime? ResponseDueDate,
    Guid? AssignedToUserId,
    Guid? ReportedByUserId,
    Guid? RespondedByUserId,
    Guid? WorkTaskId,
    string? Location,
    string? Discipline,
    string? Resolution,
    string? RfiQuestion,
    string? RfiAnswer,
    string? ExternalReference
);

public record IssueCommentCreateRequest(
    string Message,
    bool IsInternal,
    Guid? AuthorId,
    IEnumerable<IssueAttachmentCreateRequest>? Attachments
);

public record IssueAttachmentCreateRequest(
    string FileName,
    string FileUrl,
    string ContentType,
    long FileSize,
    Guid? UploadedByUserId
);

public record IssueLinkCreateRequest(
    IssueLinkType LinkType,
    Guid? RelatedEntityId,
    string? ExternalReference,
    string? Label,
    string? Metadata
);
