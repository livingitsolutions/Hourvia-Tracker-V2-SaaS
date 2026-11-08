import { ApiError } from '../platform/errors';
export interface VerifiedActor {
  userId: string;
  sessionId: string;
}
export type Permission = 'foundation:read';
export interface IdentityVerifier {
  verify(request: Request): Promise<VerifiedActor>;
}
export interface MembershipDecision {
  organizationId: string;
  userId: string;
  active: boolean;
  sessionActive: boolean;
  permissions: readonly Permission[];
}
export interface AuthorizationService {
  // Future implementation must query current membership, session denial and scopes server-side.
  resolve(
    actor: VerifiedActor,
    organizationId: string,
  ): Promise<MembershipDecision | null>;
}
declare const authorizedContext: unique symbol;
export interface OrganizationContext {
  readonly [authorizedContext]: true;
  readonly organizationId: string;
  readonly actor: VerifiedActor;
}
export async function requireOrganization(
  actor: VerifiedActor,
  organizationId: string,
  authorization: AuthorizationService,
): Promise<OrganizationContext> {
  const decision = await authorization.resolve(actor, organizationId);
  if (
    !decision ||
    decision.organizationId !== organizationId ||
    decision.userId !== actor.userId ||
    !decision.active ||
    !decision.sessionActive
  )
    throw new ApiError('NOT_FOUND');
  if (!decision.permissions.includes('foundation:read'))
    throw new ApiError('FORBIDDEN');
  return { organizationId, actor } as OrganizationContext;
}
