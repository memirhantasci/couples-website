"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import { createSession, destroySession, getSession } from "@/lib/auth/session";

const loginSchema = z.object({
  username: z.string().min(1, "Kullanıcı adı gerekli"),
  password: z.string().min(1, "Şifre gerekli"),
});

const registerSchema = z.object({
  displayName: z.string().min(1, "İsim gerekli").max(50, "İsim çok uzun"),
  username: z.string().min(1, "Kullanıcı adı gerekli"),
  password: z.string().min(1, "Şifre gerekli"),
});

export interface LoginState {
  error?: string;
  success?: boolean;
  redirectUrl?: string;
}

export async function loginAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  let userRole: string = "USER";
  try {
    console.log("Login Attempt:", formData.get("username"));
    const parsed = loginSchema.safeParse({
      username: formData.get("username"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      return { error: parsed.error.errors[0].message };
    }

    const { username, password } = parsed.data;
    const supabase = createServerClient();

    // Find user by username
    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, password, role, display_name")
      .eq("username", username.trim().toLowerCase())
      .single();

    if (error || !user) {
      console.error("Login Select Error:", error);
      return { error: "Kullanıcı adı veya şifre hatalı." };
    }

    // Plain text password comparison
    if (user.password !== password.trim()) {
      console.log("Password mismatch for:", username);
      return { error: "Kullanıcı adı veya şifre hatalı." };
    }

    // Get client info for login log
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0] ||
      headersList.get("x-real-ip") ||
      "unknown";

    // Parse user agent (simplified without ua-parser-js on server action)
    let browser = "Unknown";
    let os = "Unknown";
    let deviceType = "desktop";

    if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Edg")) browser = "Edge";
    else if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Safari")) browser = "Safari";

    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Mac")) os = "macOS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("iOS") || userAgent.includes("iPhone") || userAgent.includes("iPad"))
      os = "iOS";

    if (userAgent.includes("Mobi") || userAgent.includes("Android")) deviceType = "mobile";
    else if (userAgent.includes("Tablet") || userAgent.includes("iPad")) deviceType = "tablet";

    // Create login log entry
    const { data: loginLog, error: logError } = await supabase
      .from("login_logs")
      .insert({
        user_id: user.id,
        ip_address: ipAddress,
        browser,
        operating_system: os,
        device_type: deviceType,
      })
      .select("id")
      .single();

    if (logError) {
      console.error("Login Log Error:", logError);
    }

    const nowTR = new Date(Date.now() + 3 * 60 * 60 * 1000);
    const today = nowTR.toISOString().slice(0, 10);

    // Create session
    await createSession({
      userId: user.id,
      username: user.username,
      displayName: user.display_name || user.username,
      role: user.role as "ADMIN" | "USER",
      loginDate: today,
      loginLogId: loginLog?.id ?? 0,
    });

    userRole = user.role;
  } catch (err: any) {
    console.error("Unexpected error in loginAction:", err);
    return { error: "Sunucu tarafında beklenmeyen bir hata oluştu." };
  }

  // Next.js redirect must be outside try-catch to work properly
  if (userRole === "ADMIN") {
    redirect("/admin");
  } else {
    redirect("/home");
  }
}

export async function logoutAction(): Promise<void> {
  const session = await getSession();

  if (session?.loginLogId) {
    const supabase = createServerClient();
    const loginAt = new Date();

    // Update logout time and session duration
    const { data: log } = await supabase
      .from("login_logs")
      .select("login_at")
      .eq("id", session.loginLogId)
      .single();

    if (log?.login_at) {
      const loginTime = new Date(log.login_at);
      const sessionDuration = Math.floor((loginAt.getTime() - loginTime.getTime()) / 1000);

      await supabase
        .from("login_logs")
        .update({
          logout_at: new Date().toISOString(),
          session_duration: sessionDuration,
        })
        .eq("id", session.loginLogId);
    }
  }

  await destroySession();
  redirect("/login");
}

export async function registerAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = registerSchema.safeParse({
    displayName: formData.get("displayName"),
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const displayName = parsed.data.displayName.trim();
  const username = parsed.data.username.trim().toLowerCase();
  const password = parsed.data.password.trim();

  // Prevent registration of 'adminadmin'
  if (username === "adminadmin") {
    return { error: "Bu kullanıcı adı yönetici için ayrılmıştır." };
  }

  const supabase = createServerClient();

  // Check if username exists
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .single();

  if (existing) {
    return { error: "Bu kullanıcı adı zaten alınmış." };
  }

  // Insert user
  const { error: insertError } = await supabase
    .from("users")
    .insert({
      display_name: displayName,
      username,
      password,
      role: "USER"
    });

  if (insertError) {
    console.error("Register Error:", insertError);
    return { error: "Kayıt olurken bir hata oluştu: " + insertError.message };
  }

  redirect("/login");
}

export async function changePasswordAction(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const username = parsed.data.username.trim().toLowerCase();
  const password = parsed.data.password.trim();

  if (username === "adminadmin") {
    return { error: "Admin şifresi sadece veritabanından değiştirilebilir." };
  }

  const supabase = createServerClient();
  
  const { data: user, error: checkError } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .single();

  if (checkError || !user) {
    return { error: "Kullanıcı bulunamadı." };
  }

  const { error: updateError } = await supabase
    .from("users")
    .update({ password })
    .eq("username", username);

  if (updateError) {
    return { error: "Şifre güncellenirken hata oluştu." };
  }

  return { success: true };
}
