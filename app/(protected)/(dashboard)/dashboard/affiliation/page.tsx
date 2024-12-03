import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/lib/db";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { EarningsTable } from "./_components/earnings-table";
import { ReferralCard } from "./_components/referral-card";
import { ReferralsTable } from "./_components/referrals-table";

export const metadata: Metadata = {
  title: "Affiliation - Dashboard",
};

const AffiliationPage = async () => {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      referralCode: true,
      currency: true,
      referrals: {
        select: {
          id: true,
          name: true,
          email: true,
          hasFirstDeposit: true,
          createdAt: true,
        },
      },
    },
  });

  const affiliateEarnings = await db.transaction.findMany({
    where: {
      userId: session.user.id,
      isAffiliateReward: true,
    },
    select: {
      id: true,
      amount: true,
      createdAt: true,
      affiliateRewardTransaction: {
        select: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const canEditReferralCode = user?.referrals.length === 0;

  if (!user?.referralCode) {
    // Generate referral code if not exists
    await db.user.update({
      where: { id: session.user.id },
      data: { referralCode: crypto.randomUUID() },
    });
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Affiliation"
        description="Invitez vos amis et gagnez de l'argent !"
      />

      <Tabs defaultValue="referrals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>
        <TabsContent value="referrals" className="space-y-6">
          <ReferralCard
            referralCode={user?.referralCode ?? ""}
            canEdit={canEditReferralCode}
          />
          <ReferralsTable referrals={user?.referrals ?? []} />
        </TabsContent>
        <TabsContent value="earnings" className="space-y-4">
          <EarningsTable
            earnings={affiliateEarnings}
            currency={user?.currency ?? "XAF"}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AffiliationPage;
