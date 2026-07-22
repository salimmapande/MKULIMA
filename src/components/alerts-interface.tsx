"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Droplets,
  MessageSquare,
  Loader2,
  Check,
  Clock,
  Smartphone,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import {
  getProfile,
  getSmsBalance,
  addSmsCredits,
  deductSmsCredit,
  saveSmsTransaction,
  updateSmsTransaction,
  getWateringAlerts,
  saveWateringAlerts,
} from "@/lib/storage";
import {
  SMS_PACKAGES,
  MOBILE_MONEY_PROVIDERS,
  formatTzs,
  defaultWateringAlert,
} from "@/lib/sms";
import { cropLabels } from "@/lib/crops";
import { SITE_CONFIG } from "@/lib/site";
import type {
  FarmerProfile,
  MobileMoneyProvider,
  SmsPackage,
  WateringAlert,
  WateringSchedule,
} from "@/lib/types";
import { Card } from "./card";
import { cn } from "@/lib/utils";

export function AlertsInterface() {
  const [profile, setProfile] = useState<FarmerProfile | null>(null);
  const [balance, setBalance] = useState(0);
  const [schedules, setSchedules] = useState<WateringSchedule[]>([]);
  const [alerts, setAlerts] = useState<WateringAlert[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<SmsPackage | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<MobileMoneyProvider | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [sendingAlert, setSendingAlert] = useState<string | null>(null);

  const isSw = profile?.language === "sw";

  const loadSchedules = useCallback(async (p: FarmerProfile) => {
    setLoadingSchedules(true);
    try {
      const res = await fetch("/api/watering", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: p, action: "schedule" }),
      });
      const data = await res.json();
      setSchedules(data.schedules ?? []);

      const existing = getWateringAlerts();
      const merged = (data.schedules as WateringSchedule[]).map((s: WateringSchedule) => {
        const found = existing.find((a) => a.crop === s.crop);
        return found ?? defaultWateringAlert(s.crop, s.frequencyDays, s.preferredTime);
      });
      setAlerts(merged);
      saveWateringAlerts(merged);
    } catch {
      setSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  }, []);

  useEffect(() => {
    const p = getProfile();
    setProfile(p);
    setBalance(getSmsBalance());
    if (p.crops.length) loadSchedules(p);
  }, [loadSchedules]);

  function toggleAlert(crop: WateringAlert["crop"]) {
    const updated = alerts.map((a) =>
      a.crop === crop ? { ...a, enabled: !a.enabled } : a
    );
    setAlerts(updated);
    saveWateringAlerts(updated);
  }

  async function sendTestAlert(schedule: WateringSchedule) {
    if (!profile?.phone) {
      setPaymentMessage(
        isSw ? "Weka nambari ya simu kwenye wasifu wako kwanza." : "Add your phone number in profile first."
      );
      return;
    }
    if (balance <= 0) {
      setPaymentMessage(
        isSw ? "Huna salio la SMS. Nunua kifurushi cha SMS hapa chini." : "No SMS credits. Buy an SMS package below."
      );
      return;
    }

    setSendingAlert(schedule.crop);
    try {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: profile.phone,
          profile,
          schedule,
        }),
      });
      const data = await res.json();
      if (data.sent) {
        const ok = deductSmsCredit();
        if (ok) setBalance(getSmsBalance());
        setPaymentMessage(isSw ? "Arifa ya SMS imetumwa!" : "SMS alert sent!");
      } else {
        setPaymentMessage(data.error ?? (isSw ? "Imeshindwa kutuma SMS" : "Failed to send SMS"));
      }
    } catch {
      setPaymentMessage(isSw ? "Hitilafu ya mtandao" : "Network error");
    } finally {
      setSendingAlert(null);
    }
  }

  async function initiatePayment() {
    if (!selectedPackage || !selectedProvider || !profile?.phone) {
      setPaymentMessage(
        isSw
          ? "Chagua kifurushi, mtandao wa malipo, na weka simu kwenye wasifu."
          : "Select package, payment provider, and add phone in profile."
      );
      return;
    }

    setPaymentLoading(true);
    setPaymentMessage(null);
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: selectedProvider,
          phone: profile.phone,
          packageId: selectedPackage.id,
          language: profile.language,
        }),
      });
      const data = await res.json();
      if (data.transaction && data.payment) {
        saveSmsTransaction(data.transaction);

        if (data.instantComplete) {
          updateSmsTransaction(data.transaction.id, { status: "completed" });
          const newBal = addSmsCredits(selectedPackage.credits);
          setBalance(newBal);
          setPaymentMessage(data.message ?? (isSw ? "Ununuzi umekamilika!" : "Purchase complete!"));
          setSelectedPackage(null);
          setSelectedProvider(null);
        } else {
          setPaymentMessage(isSw ? data.payment.instructionsSw : data.payment.instructions);

          setTimeout(() => {
            updateSmsTransaction(data.transaction.id, { status: "completed" });
            const newBal = addSmsCredits(selectedPackage.credits);
            setBalance(newBal);
            setPaymentMessage(
              isSw
                ? `Malipo yamekamilika! Salio jipya: SMS ${newBal}`
                : `Payment complete! New balance: ${newBal} SMS`
            );
            setSelectedPackage(null);
            setSelectedProvider(null);
          }, 3000);
        }
      } else {
        setPaymentMessage(data.error ?? (isSw ? "Malipo yameshindwa" : "Payment failed"));
      }
    } catch {
      setPaymentMessage(isSw ? "Hitilafu ya malipo" : "Payment error");
    } finally {
      setPaymentLoading(false);
    }
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-terracotta" />
          <h1 className="font-display text-2xl font-bold text-forest">
            {isSw ? "Arifa za SMS" : "SMS Alerts"}
          </h1>
        </div>
        <p className="mt-1 text-sm text-muted">
          {isSw
            ? "Pata arifa za kumwagilia shamba na taarifa za kilimo kupitia SMS"
            : "Get watering alerts and farming tips via SMS"}
        </p>
      </div>

      <Card variant="forest" className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6" />
            <div>
              <p className="text-xs opacity-80">{isSw ? "Salio la SMS" : "SMS Balance"}</p>
              <p className="font-display text-2xl font-bold">{balance}</p>
            </div>
          </div>
          <div className="text-right text-xs opacity-80">
            <Smartphone className="ml-auto h-4 w-4" />
            <p className="mt-1">{profile?.phone || (isSw ? "Hakuna simu" : "No phone")}</p>
          </div>
        </div>
      </Card>

      {!profile?.phone && (
        <Card className="mb-4 border-amber-200 bg-amber-50">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              {isSw
                ? "Weka nambari yako ya simu kwenye Wasifu ili kupokea arifa za SMS."
                : "Add your phone number in Profile to receive SMS alerts."}
            </p>
          </div>
        </Card>
      )}

      <section className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Droplets className="h-5 w-5 text-forest" />
          <h2 className="font-display text-lg font-semibold text-forest">
            {isSw ? "Ratiba ya Kumwagilia" : "Watering Schedule"}
          </h2>
        </div>

        {loadingSchedules ? (
          <Card className="flex items-center justify-center gap-2 py-8">
            <Loader2 className="h-5 w-5 animate-spin text-forest" />
            <span className="text-sm text-muted">
              {isSw ? "Inatengeneza ratiba..." : "Generating schedule..."}
            </span>
          </Card>
        ) : schedules.length === 0 ? (
          <Card className="text-center text-sm text-muted">
            {isSw
              ? "Ongeza mazao kwenye wasifu wako ili kupata ratiba ya kumwagilia."
              : "Add crops to your profile to get watering schedules."}
          </Card>
        ) : (
          <div className="space-y-2">
            {schedules.map((schedule) => {
              const alert = alerts.find((a) => a.crop === schedule.crop);
              const enabled = alert?.enabled ?? false;
              return (
                <Card key={schedule.crop} className="!p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-semibold text-soil">
                        {isSw ? schedule.cropLabelSw : schedule.cropLabel}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {schedule.preferredTime}
                        </span>
                        <span>
                          {isSw
                            ? `Kila siku ${schedule.frequencyDays}`
                            : `Every ${schedule.frequencyDays} days`}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-soil-light">
                        {isSw ? schedule.amountSw : schedule.amount}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleAlert(schedule.crop)}
                      className={cn(
                        "rounded-full px-3 py-1 text-[10px] font-bold uppercase transition-colors",
                        enabled
                          ? "bg-forest text-white"
                          : "bg-cream-dark text-muted"
                      )}
                    >
                      {enabled ? (isSw ? "Washa" : "On") : isSw ? "Zima" : "Off"}
                    </button>
                  </div>
                  {enabled && (
                    <button
                      onClick={() => sendTestAlert(schedule)}
                      disabled={sendingAlert === schedule.crop}
                      className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-sage-light/50 py-2 text-xs font-medium text-forest hover:bg-sage-light"
                    >
                      {sendingAlert === schedule.crop ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <MessageSquare className="h-3 w-3" />
                      )}
                      {isSw ? "Tuma arifa ya majaribio (SMS 1)" : "Send test alert (1 SMS)"}
                    </button>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-terracotta" />
          <h2 className="font-display text-lg font-semibold text-forest">
            {isSw ? "Nunua SMS" : "Buy SMS Credits"}
          </h2>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2">
          {SMS_PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg)}
              className={cn(
                "rounded-xl border p-3 text-left transition-all",
                selectedPackage?.id === pkg.id
                  ? "border-terracotta bg-terracotta/10 shadow-sm"
                  : "border-card-border bg-white hover:border-sage"
              )}
            >
              <p className="text-xs font-medium text-muted">
                {isSw ? pkg.labelSw : pkg.label}
              </p>
              <p className="font-display text-lg font-bold text-forest">
                {formatTzs(pkg.priceTzs)}
              </p>
              <p className="text-[10px] text-muted">
                {formatTzs(Math.round(pkg.priceTzs / pkg.credits))}/{isSw ? "SMS" : "SMS"}
              </p>
            </button>
          ))}
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-forest">
          {isSw ? "Chagua mtandao wa malipo" : "Select payment provider"}
        </p>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {MOBILE_MONEY_PROVIDERS.map((provider) => (
            <button
              key={provider.id}
              onClick={() => setSelectedProvider(provider.id)}
              className={cn(
                "flex items-center gap-2 rounded-xl border p-3 text-left transition-all",
                selectedProvider === provider.id
                  ? "border-forest bg-forest/5 shadow-sm"
                  : "border-card-border bg-white hover:border-sage"
              )}
            >
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: provider.color }}
              />
              <div>
                <p className="text-sm font-semibold text-soil">
                  {isSw ? provider.nameSw : provider.name}
                </p>
                <p className="text-[10px] text-muted">{provider.prefix}</p>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={initiatePayment}
          disabled={paymentLoading || !selectedPackage || !selectedProvider}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-terracotta py-3.5 font-semibold text-white shadow-lg shadow-terracotta/25 transition-all hover:bg-terracotta-dark disabled:opacity-50"
        >
          {paymentLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <CreditCard className="h-5 w-5" />
          )}
          {isSw
            ? selectedProvider === "twilio"
              ? "Nunua Mtandaoni"
              : "Lipa kwa Simu"
            : selectedProvider === "twilio"
              ? "Buy Online"
              : "Pay with Mobile Money"}
        </button>

        <p className="mt-2 text-center text-[10px] text-muted">
          {isSw
            ? selectedProvider === "twilio"
              ? "Malipo ya mtandaoni kupitia Twilio SMS API"
              : `M-Pesa, Mixx by Yas, Airtel Money, Halotel Money — ${SITE_CONFIG.country}`
            : selectedProvider === "twilio"
              ? "Online purchase powered by Twilio SMS API"
              : `M-Pesa, Mixx by Yas, Airtel Money, Halotel Money — ${SITE_CONFIG.country}`}
        </p>
      </section>

      {paymentMessage && (
        <Card className="mt-4 bg-sage-light/30">
          <div className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
            <p className="text-sm text-soil">{paymentMessage}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
