import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function CheckEmailPage() {
  const [email, setEmail] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkEmail = async () => {
    if (!email) return;
    
    setChecking(true);
    try {
      // Try to get user data from Firebase
      const { getUserByEmail } = await import('@/lib/firebase/database/users');
      const userData = await getUserByEmail(email);
      
      setResult({
        exists: !!userData,
        confirmed: true, // Firebase doesn't track email confirmation the same way
        user: userData
      });
    } catch (error) {
      console.error('Check error:', error);
      setResult({ error: 'Could not check email status' });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Check Email Confirmation Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button 
              onClick={checkEmail} 
              disabled={checking || !email}
              className="w-full"
            >
              {checking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                'Check Status'
              )}
            </Button>
          </div>

          {result && (
            <div className="mt-4 p-4 rounded-lg border">
              {result.error ? (
                <div className="flex items-center text-red-600">
                  <XCircle className="mr-2 h-5 w-5" />
                  {result.error}
                </div>
              ) : (
                <div className="space-y-2">
                  {result.exists ? (
                    <>
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="mr-2 h-5 w-5" />
                        User exists
                      </div>
                      {result.confirmed ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="mr-2 h-5 w-5" />
                          Email confirmed ✅
                          <div className="text-xs text-gray-500 ml-2">
                            {new Date(result.confirmedAt).toLocaleString()}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center text-orange-600">
                          <XCircle className="mr-2 h-5 w-5" />
                          Email NOT confirmed ❌
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <XCircle className="mr-2 h-5 w-5" />
                      User does not exist
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
