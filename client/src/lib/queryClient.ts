import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
): Promise<any> {
  const { method = "GET", body, headers = {} } = options;
  
  // Get current user from session via auth API
  let currentUser = null;
  try {
    const authResponse = await fetch("/api/auth/user", {
      credentials: "include",
    });
    if (authResponse.ok) {
      currentUser = await authResponse.json();
    }
  } catch (error) {
    // Ignore auth errors for now
  }
  
  const requestHeaders: Record<string, string> = {
    ...headers,
  };
  
  if (body) {
    requestHeaders["Content-Type"] = "application/json";
  }
  
  // Always include the x-user-id header if available from either source
  if (currentUser?.id) {
    requestHeaders["x-user-id"] = currentUser.id;
  } else if (headers["x-user-id"]) {
    requestHeaders["x-user-id"] = headers["x-user-id"];
  }
  
  console.log("🔍 API REQUEST - Headers being sent:", requestHeaders);

  const res = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey, meta }) => {
    // Get current user from session via auth API
    let currentUser = null;
    try {
      const authResponse = await fetch("/api/auth/user", {
        credentials: "include",
      });
      if (authResponse.ok) {
        currentUser = await authResponse.json();
      }
    } catch (error) {
      // Ignore auth errors for queries
    }
    
    const headers: Record<string, string> = {
      ...((meta as any)?.headers || {}),
    };
    
    if (currentUser?.id) {
      headers["x-user-id"] = currentUser.id;
    }

    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers,
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
