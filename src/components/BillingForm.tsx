"use client";
import React from "react";
import { getUserSubscriptionPlan } from "../lib/stripe";
import { toast } from "sonner";
import { trpc } from "../app/_trpc/client";
import { Loader2 } from "lucide-react";
import MaxWidthWrapper from "./MaxWidthWrapper";
import { Button } from "./ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface BillingFormProps {
  subscriptionPlan: Awaited<ReturnType<typeof getUserSubscriptionPlan>>;
}

const BillingForm = ({ subscriptionPlan }: BillingFormProps) => {
  const {mutate:createStripeSession,isPending} = trpc.createStripeSession.useMutation({
    onSuccess: ({ url }) => {
      if (url) window.location.href = url;
      if (!url) {
        toast("There was a problem...",
          {
            description: "Please try again in a moment",
            classNames: {
              error: "bg-red-600 text-white border border-red-800 shadow-lg",
            },
          });
      }
    },
  });

  return (
     <MaxWidthWrapper className='max-w-5xl'>
      <form
        className='mt-12'
        onSubmit={(e) => {
          e.preventDefault()
          createStripeSession()
        }}>
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan</CardTitle>
            <CardDescription>
              You are currently on the{' '}
              <strong>{subscriptionPlan.name}</strong> plan.
            </CardDescription>
          </CardHeader>

          <CardFooter className='flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0'>
            <Button type='submit'>
              {isPending ? (
                <Loader2 className='mr-4 h-4 w-4 animate-spin' />
              ) : null}
              {subscriptionPlan.isSubscribed
                ? 'Manage Subscription'
                : 'Upgrade to HERO'}
            </Button>

            {subscriptionPlan.isSubscribed ? (
              <p className='rounded-full text-xs font-medium'>
                {subscriptionPlan.isCanceled
                  ? 'Your plan will be canceled on '
                  : 'Your plan renews on'}
                {format(
                  subscriptionPlan.stripeCurrentPeriodEnd!,
                  'dd.MM.yyyy'
                )}
                .
              </p>
            ) : null}
          </CardFooter>
        </Card>
      </form>
    </MaxWidthWrapper>
  )
    
};

export default BillingForm;
