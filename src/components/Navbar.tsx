import MaxWidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import { getKindeServerSession, LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight } from "lucide-react";
import UserAccountNav from "./UserAccountNav";

const Navbar = async () => {

  const {getUser}=getKindeServerSession()
  const user=await getUser()

  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all ">
      <MaxWidthWrapper>
        <div className="flex items-center justify-between">
          {/* Left side */}
          <Link href="/" className="flex z-40 font-semibold">
            <span className="mt-4">Docmind.</span>
          </Link>

          {/* Right side */}
          <div className="hidden items-center space-x-4 sm:flex">
           { !user ? <>
            <Link
              href="/pricing"
              className={`${buttonVariants({
                variant: "ghost",
                size: "sm",
              })} mt-2.5 `}
            >
              Pricing
            </Link>
            <LoginLink  className={`${buttonVariants({
                variant: "ghost",
                size: "sm",
              })} mt-2.5 `}>
               Sign in
            </LoginLink>
              <RegisterLink  className={`${buttonVariants({
                
                size: "sm",
              })} mt-2.5 `}>
               Get started <ArrowRight className="ml-1.5 h-5 w-5"/>
            </RegisterLink>
            </> : (<>
            <Link
              href="/Dashboard"
              className={`${buttonVariants({
                variant: "ghost",
                size: "sm",
              })} mt-2.5 `}
            >
              Dashboard
            </Link> 
            <UserAccountNav name={
            !user?.given_name || !user.family_name ? "Your Account" : `${user.given_name} ${user.family_name}`
            } 
            email={user.email ?? ''}
            imageUrl={user.picture ?? ''}/>
            </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
