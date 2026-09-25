let profilePromise: Promise<any> | null = null;
let cachedProfile: any = null;

export async function fetchProfileData(forceRefresh = false): Promise<any> {
  if (cachedProfile && !forceRefresh) {
    return cachedProfile;
  }

  if (profilePromise && !forceRefresh) {
    return profilePromise;
  }

  profilePromise = fetch('/api/profile')
    .then(async (res) => {
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      cachedProfile = data;
      profilePromise = null;
      return data;
    })
    .catch((err) => {
      profilePromise = null;
      throw err;
    });

  return profilePromise;
}

export function clearProfileCache(): void {
  cachedProfile = null;
  profilePromise = null;
}
