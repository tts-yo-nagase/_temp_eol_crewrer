import { Button } from '@/components/ui/button';
import { ContactRound, Github, Laptop, Chrome } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import React from 'react';

const SsoButtons = () => {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/main"

  const handleSignInGithub = async () => {
    await signIn("github", { callbackUrl })
  }
  const handleSignInAzure = async () => {
    await signIn("azure-ad", { callbackUrl })
  }
  const handleSignInAzureB2C = async () => {
    await signIn("azure-ad-b2c", { callbackUrl })
  }
  const handleSignInGoogle = async () => {
    await signIn("google", { callbackUrl })
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={() => handleSignInGithub()}
        className="w-full flex items-center justify-center gap-2"
        variant="outline"
      >
        <Github className="h-5 w-5" />
        Login with Github
      </Button>
      <Button
        onClick={() => handleSignInAzure()}
        className="w-full flex items-center justify-center gap-2"
        variant="outline"
      >
        <Laptop className="h-5 w-5" />
        Login with Azure AD
      </Button>

      <Button
        onClick={() => handleSignInAzureB2C()}
        className="w-full flex items-center justify-center gap-2"
        variant="outline"
      >
        <ContactRound className="h-5 w-5" />
        Login with Azure AD B2C
      </Button>

      <Button
        onClick={() => handleSignInGoogle()}
        className="w-full flex items-center justify-center gap-2"
        variant="outline"
      >
        <Chrome className="h-5 w-5" />
        Login with Google
      </Button>
    </div>
  )
};

export default SsoButtons;

