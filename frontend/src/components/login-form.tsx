"use client"
import { cn } from "@/lib/utils"
import SsoButtons from "@/app/login/sso-buttons"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {

  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault()
  //   const formData = new FormData(e.currentTarget)
  //   const email = formData.get('email')
  //   const password = formData.get('password')

  //   console.log('Login attempt:', { email, password })
  //   // Add your login logic here
  //   router.push("/main/dashboard")
  // }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" required />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="#" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card> */}
      <SsoButtons />
    </div>
  )
}
