import { inferRouterOutputs } from "@trpc/server";
import { appRouter } from "@/src/trpc";
import { JSX } from "react";

type RouterOutput = inferRouterOutputs<typeof appRouter>

type Messages=RouterOutput["getFileMessages"]["messages"]

type OmitText=Omit<Messages[number],"text">

type ExtendedText={
    text:string | JSX.Element
}

export type ExtendedMessages=OmitText & ExtendedText