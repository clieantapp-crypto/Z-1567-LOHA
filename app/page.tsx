"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { AlertCircle, Eye, EyeOff, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/firestore";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
// NEW
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  serverTimestamp,
  onSnapshot,
  runTransaction,
  Timestamp,
} from "firebase/firestore";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const db = getFirestore();

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const router = useRouter();

  // NEW: session lease state
  const [leaseError, setLeaseError] = useState<string | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionId = useMemo(() => crypto.randomUUID(), []);
  const deviceInfo = useMemo(() => {
    // مُعرّف بسيط للجهاز/المتصفح الحالي
    const key = "deviceId";
    let val = localStorage.getItem(key);
    if (!val) {
      val = crypto.randomUUID();
      localStorage.setItem(key, val);
    }
    return val;
  }, []);

  // تذكُّر البريد الإلكتروني
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail, rememberMe: true }));
    }
  }, []);

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => {
      const next = { ...prev, rememberMe: checked };
      if (checked) localStorage.setItem("rememberedEmail", next.email);
      else localStorage.removeItem("rememberedEmail");
      return next;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === "email" && prev.rememberMe) {
        // تحديث البريد المحفوظ عند تفعيل "تذكرني"
        localStorage.setItem("rememberedEmail", value);
      }
      return next;
    });
  };

  // NEW: وظائف إدارة الجلسة الوحيدة في Firestore
  const acquireSessionLease = async (uid: string) => {
    // مستند الجلسة لكل مستخدم
    const leaseRef = doc(db, "userSessions", uid);

    // نافذة انتهاء الجلسة (إذا لم يصل heartbeat خلال هذه المدة نعتبر الجلسة منتهية)
    const LEASE_TTL_SECONDS = 60; // عدّلها حسب رغبتك

    await runTransaction(db, async (tx) => {
      const snap = await tx.get(leaseRef);

      const now = Timestamp.now();

      if (!snap.exists()) {
        // لا توجد جلسة قديمة — أنشئ جلسة
        tx.set(leaseRef, {
          sessionId,
          deviceInfo,
          uid,
          lastSeenAt: serverTimestamp(),
          expiresAt: Timestamp.fromMillis(now.toMillis() + LEASE_TTL_SECONDS * 1000),
        });
        return;
      }

      const data = snap.data() as any;

      // إن كانت الجلسة الحالية (نفس sessionId) — حدّثها
      if (data.sessionId === sessionId) {
        tx.update(leaseRef, {
          lastSeenAt: serverTimestamp(),
          expiresAt: Timestamp.fromMillis(now.toMillis() + LEASE_TTL_SECONDS * 1000),
        });
        return;
      }

      // إن كانت الجلسة منتهية (انتهت مدة TTL) — استبدلها بالجلسة الجديدة
      if (data.expiresAt?.toMillis?.() < now.toMillis()) {
        tx.set(leaseRef, {
          sessionId,
          deviceInfo,
          uid,
          lastSeenAt: serverTimestamp(),
          expiresAt: Timestamp.fromMillis(now.toMillis() + LEASE_TTL_SECONDS * 1000),
        });
        return;
      }

      // توجد جلسة نشطة مختلفة — ارفض الاستحواذ
      throw new Error("ACTIVE_SESSION_EXISTS");
    });
  };

  const startHeartbeat = (uid: string) => {
    const leaseRef = doc(db, "userSessions", uid);
    const LEASE_TTL_SECONDS = 60;

    // تحديث كل 20 ثانية مثلاً
    heartbeatRef.current = setInterval(async () => {
      const now = Timestamp.now();
      try {
        await setDoc(
          leaseRef,
          {
            sessionId,
            lastSeenAt: serverTimestamp(),
            // مدّد الانتهاء
            expiresAt: Timestamp.fromMillis(now.toMillis() + LEASE_TTL_SECONDS * 1000),
          },
          { merge: true }
        );
      } catch {
        // تجاهل
      }
    }, 20000);
  };

  const stopHeartbeat = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  };

  const releaseLease = async (uid: string) => {
    try {
      const leaseRef = doc(db, "userSessions", uid);
      const snap = await getDoc(leaseRef);
      if (snap.exists() && (snap.data() as any).sessionId === sessionId) {
        await deleteDoc(leaseRef);
      }
    } catch {
      // تجاهل
    }
  };

  // NEW: راقب تغيُّر الجلسة في الوقت الحقيقي — لو فقدنا القفل، سجّل خروجًا
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setLeaseError(null);

      if (!user) {
        stopHeartbeat();
        return;
      }

      // ابدأ الاستماع على مستند الجلسة
      const leaseRef = doc(db, "userSessions", user.uid);
      const off = onSnapshot(leaseRef, (snap) => {
        const data = snap.data() as any | undefined;
        if (!data) {
          // ربما تم تحرير القفل — لا مشكلة
          return;
        }

        // لو تغيّرت sessionId إلى جلسة أخرى (أخذ شخص آخر القفل) — سجّل خروجًا
        if (data.sessionId && data.sessionId !== sessionId) {
          setLeaseError("هذا الحساب مستخدم حاليًا على جهاز آخر.");
          stopHeartbeat();
          signOut(auth).catch(() => {});
        }
      });

      return () => off();
    });

    // تنظيف عند إغلاق/تحديث الصفحة — حرّر القفل
    const handleBeforeUnload = async () => {
      const u = auth.currentUser;
      if (u) await releaseLease(u.uid);
      stopHeartbeat();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      unsub();
    };
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLeaseError(null);
    setIsLoading(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, formData.email, formData.password);

      // حاول الحصول على قفل الجلسة
      try {
        await acquireSessionLease(cred.user.uid);
        startHeartbeat(cred.user.uid);
      } catch (leaseErr: any) {
        // إن كانت هناك جلسة نشطة — امنع الدخول
        if (leaseErr?.message === "ACTIVE_SESSION_EXISTS") {
          await signOut(auth);
          setLeaseError("هذا الحساب مسجّل دخول بالفعل على جهاز آخر. الرجاء تسجيل الخروج هناك أولًا.");
          return;
        }
        // خطأ غير متوقع
        await signOut(auth);
        setLeaseError("تعذّر التحقق من الجلسة. حاول مرة أخرى.");
        return;
      }

      // نجاح — انتقل
      router.push("/notifications");
    } catch (err) {
      setError("فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-white/10 p-4 rounded-full">
            <User className="h-12 w-12 text-green-500" />
          </div>
        </div>

        <div>
          <Card className="border-0 shadow-xl bg-gray-800 text-white overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>

            <CardHeader className="space-y-1 text-center pt-8">
              <CardTitle className="text-2xl font-bold text-white">تسجيل الدخول</CardTitle>
              <p className="text-gray-400 text-sm">أدخل بيانات الاعتماد الخاصة بك للوصول إلى حسابك</p>
            </CardHeader>

            <CardContent className="pt-6">
              {(error || leaseError) && (
                <div className="mb-4">
                  <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-500">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{leaseError || error}</AlertDescription>
                  </Alert>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-300">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="ادخل البريد الإلكتروني"
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 pr-4"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="text-sm font-medium text-gray-300">
                      كلمة المرور
                    </label>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="ادخل كلمة المرور"
                      className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 pr-4"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute left-0 top-0 h-full px-3 py-2 hover:bg-transparent hover:text-green-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={handleCheckboxChange}
                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />
                  <label
                    htmlFor="rememberMe"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                  >
                    تذكرني
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-md transition-all duration-200 flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري تسجيل الدخول...</span>
                    </div>
                  ) : (
                    <>
                      <span>تسجيل الدخول</span>
                      <LogIn className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-xs">© {new Date().getFullYear()} جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
}
