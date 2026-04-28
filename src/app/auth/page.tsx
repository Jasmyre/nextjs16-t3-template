import { FaGithub, FaGoogle } from "react-icons/fa";
import { AuthProviderButton } from "@/components/auth-provider-button";
import { LogInForm } from "@/components/login-form";
import { SignupForm } from "@/components/sign-up-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AuthPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center max-sm:px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-bold text-2xl">
            Welcome to ICTQuest
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <Tabs className="w-full" defaultValue="signin">
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger className="cursor-pointer" value="signin">
                Sign In
              </TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="signup">
                Sign Up
              </TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <LogInForm />
              <Button className="mt-2 cursor-pointer p-0" variant="link">
                Forgot password?
              </Button>
            </TabsContent>
            <TabsContent value="signup">
              <SignupForm />
              <br />
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex flex-col gap-10">
            <div className="relative">
              <Separator className="absolute top-[50%] bottom-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-gray-400" />
              <span className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-card px-4 text-gray-800 dark:text-gray-400">
                OR CONTINUE WITH
              </span>
            </div>
            <div className="space-y-2">
              <AuthProviderButton
                icon={<FaGoogle />}
                label="Continue with Google"
                provider="google"
              />
              <AuthProviderButton
                icon={<FaGithub />}
                label="Continue with Github"
                provider="github"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
