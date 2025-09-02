import BillingForm from "@/src/components/BillingForm"
import { getUserSubscriptionPlan } from "@/src/lib/stripe"


const Page = async () => {
    const subscriptionPlan = await getUserSubscriptionPlan()

    return <BillingForm subscriptionPlan={subscriptionPlan} /> 
}

export default Page