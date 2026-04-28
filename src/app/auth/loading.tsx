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
    <Card className="w-full max-w-md border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="font-bold text-2xl text-gray-900 dark:text-white">
          <Loading className="h-8 w-43.75" />
        </CardTitle>

        <CardDescription className="text-gray-500 dark:text-gray-400">
          <Loading className="h-5 w-62.5" />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs className="w-full" defaultValue="signin">
          <TabsList className="mb-4 grid w-full grid-cols-2 gap-2 bg-gray-200 dark:bg-gray-600">
            <TabsTrigger
              className="text-gray-500 hover:bg-gray-100 data-[state=active]:bg-gray-200 data-[state=active]:text-gray-800 dark:text-gray-400 dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-gray-300 dark:hover:bg-gray-500"
              disabled
              value="signin"
            />
            <TabsTrigger
              className="text-gray-500 hover:bg-gray-100 data-[state=active]:bg-white data-[state=active]:text-gray-800 dark:text-gray-400 dark:data-[state=active]:bg-gray-700 dark:data-[state=active]:text-gray-300 dark:hover:bg-gray-500"
              disabled
              value="signup"
            />
          </TabsList>
          <TabsContent value="signin">
            <div className="space-y-2">
              <div>
                <div className="space-y-2">
                  <Loading className="h-5 w-12.5" />
                  <Input className="border-gray-500" disabled placeholder="" />
                </div>
              </div>
              <br />

              <div>
                <div className="space-y-2">
                  <Loading className="h-5 w-20" />
                  <Input className="border-gray-500" disabled placeholder="" />
                </div>
              </div>
              <Button
                className="w-full bg-indigo-500 hover:bg-indigo-400"
                disabled
                type="submit"
              />
            </div>
            <Button
              className="mt-2 p-0 text-indigo-400 hover:text-indigo-400 dark:text-gray-300"
              variant="link"
            >
              <Loading className="h-5 w-31.25" />
            </Button>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex flex-col gap-10">
          <div className="relative">
            <Separator className="absolute top-[50%] bottom-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-gray-400" />
            <span className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-gray-50 px-4 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
              OR
            </span>
          </div>
          <div className="space-y-2">
            <Button
              className="relative flex w-full justify-center border-gray-300 bg-gray-100 text-gray-500 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
              disabled
              variant="outline"
            />
            <Button
              className="relative flex w-full justify-center border-gray-300 bg-gray-100 text-gray-500 hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
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
