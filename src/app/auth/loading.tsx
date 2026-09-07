import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const loading = () => (
  <div className="flex min-h-[80vh] items-center justify-center max-sm:px-4">
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-bold text-2xl">
          <Loading className="h-8 w-43.75" />
        </CardTitle>

        <CardDescription className="text-muted-foreground">
          <Loading className="h-5 w-62.5" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs className="w-full" defaultValue="signin">
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger disabled value="signin" />
            <TabsTrigger disabled value="signup" />
          </TabsList>
          <TabsContent value="signin">
            <div className="space-y-2">
              <div>
                <div className="space-y-2">
                  <Loading className="h-5 w-12.5" />
                  <Input disabled placeholder="" />
                </div>
              </div>
              <br />

              <div>
                <div className="space-y-2">
                  <Loading className="h-5 w-20" />
                  <Input disabled placeholder="" />
                </div>
              </div>
              <Button className="w-full" disabled type="submit" />
            </div>
            <Button className="mt-2 p-0" variant="link">
              <Loading className="h-5 w-31.25" />
            </Button>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex flex-col gap-10">
          <div className="relative">
            <Separator className="absolute top-[50%] bottom-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-border" />
            <span className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-card px-4 text-muted-foreground">
              OR
            </span>
          </div>
          <div className="space-y-2">
            <Button
              className="relative flex w-full justify-center"
              disabled
              variant="outline"
            />
            <Button
              className="relative flex w-full justify-center"
              disabled
              variant="outline"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default loading;
