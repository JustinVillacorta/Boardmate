export interface NormalizedUser {
  displayName: string;
  roleLabel: string;
  initials: string;
}

// Normalize user data from localStorage/user objects into a consistent shape
export function normalizeUserFromLocalStorage(defaultRole: 'admin' | 'staff' | 'tenant' = 'admin'): NormalizedUser {
  const fallback = {
    displayName: defaultRole === 'tenant' ? 'Tenant' : defaultRole === 'staff' ? 'Staff' : 'Admin',
    roleLabel: defaultRole === 'tenant' ? 'Tenant' : defaultRole === 'staff' ? 'Staff' : 'Admin',
    initials: defaultRole === 'tenant' ? 'T' : defaultRole === 'staff' ? 'S' : 'A',
  };

  try {
    const raw = localStorage.getItem('userData');
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);

    const capitalize = (s: string) => s.replace(/(^|[\s._-])+([a-z])/g, (_, p1, p2) => (p1 ? ' ' : '') + p2.toUpperCase()).trim();
    const prettifyUsername = (u: string) => {
      if (!u) return '';
      if (/[._\- ]/.test(u)) return u.split(/[._\- ]+/).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
      if (u.includes('@')) u = u.split('@')[0];
      return u.charAt(0).toUpperCase() + u.slice(1);
    };

    const readNameFrom = (o: any) => {
      if (!o) return null;
      const first = o.firstName || o.first_name || o.firstname || o.givenName || o.given_name || '';
      const last = o.lastName || o.last_name || o.lastname || o.familyName || o.family_name || '';
      const full = o.name || o.fullName || o.full_name || o.displayName || o.display_name || o.name_display || '';
      const username = o.username || o.userName || o.login || o.email?.split('@')[0] || o.handle || '';
      const email = o.email || '';
      const preferFull = (full || '').trim();
      const preferFirstLast = (first || last) ? `${first} ${last}`.trim() : '';
      const preferUsername = username ? prettifyUsername(username) : '';
      const preferEmailLocal = email ? email.split('@')[0] : '';
      const displayName = preferFull || preferFirstLast || preferUsername || preferEmailLocal || null;
      if (!displayName) return null;
      const words = displayName.split(/\s+/).filter(Boolean);
      const initials = (words.length === 1)
        ? words[0].charAt(0).toUpperCase()
        : (words[0].charAt(0) + (words[1].charAt(0) || '')).toUpperCase();
      return { displayName: capitalize(displayName), initials };
    };

    const tenantCandidate = readNameFrom(parsed?.tenant);
    if (tenantCandidate) return { displayName: tenantCandidate.displayName, roleLabel: 'Tenant', initials: tenantCandidate.initials };

    if (parsed?.user?.name && !(parsed?.user?.firstName || parsed?.user?.lastName)) {
      const rawName = parsed.user.name as string;
      const pretty = (rawName || '').replace(/[._\-]+/g, ' ').trim();
      const displayName = pretty ? (pretty.charAt(0).toUpperCase() + pretty.slice(1)) : null;
      if (displayName) {
        const words = displayName.split(/\s+/).filter(Boolean);
        const initials = words.length === 1 ? words[0].charAt(0).toUpperCase() : (words[0].charAt(0) + (words[1].charAt(0) || '')).toUpperCase();
        const rawRole = (parsed?.user?.role || parsed?.role || defaultRole) as string;
        const roleLabel = rawRole ? (rawRole.charAt(0).toUpperCase() + rawRole.slice(1)) : fallback.roleLabel;
        return { displayName, roleLabel, initials };
      }
    }

    const userCandidate = readNameFrom(parsed?.user);
    if (userCandidate) {
      const rawRole = (parsed?.user?.role || parsed?.role || defaultRole) as string;
      const roleLabel = rawRole ? (rawRole.charAt(0).toUpperCase() + rawRole.slice(1)) : fallback.roleLabel;
      return { displayName: userCandidate.displayName, roleLabel, initials: userCandidate.initials };
    }

    const topCandidate = readNameFrom(parsed);
    if (topCandidate) return { displayName: topCandidate.displayName, roleLabel: fallback.roleLabel, initials: topCandidate.initials };

    return fallback;
  } catch (e) {
    return fallback;
  }
}
