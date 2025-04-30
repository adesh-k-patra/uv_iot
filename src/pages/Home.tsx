import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNavigate } from "react-router-dom"
import axios from "axios"
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

export default function Home() {
  const navigate = useNavigate()

  // State for login form
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  })

  // State for signup form
  const [signupData, setSignupData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  })

  // Handle login
  const handleLogin = async () => {
    try {
      console.log(BACKEND_URL)
      const response = await axios.post(BACKEND_URL + "/v1/login", loginData)

      const accessToken = response.data?.data?.accessToken

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken)
        console.log(accessToken)
        navigate("/d")
      } else {
        console.error("Access Token not found in response")
      }
    } catch (error: any) {
      console.error("Login Error:", error.response?.data || error.message)
    }
  }

  // Handle signup
  const handleSignup = async () => {
    if (signupData.password !== signupData.confirmPassword) return // Prevent request if passwords don’t match

    try {
      const response = await axios.post(BACKEND_URL + "/v1/signup", {
        username: signupData.username,
        password: signupData.password,
      })

      const accessToken = await response.data?.data?.accessToken

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken)
        console.log(accessToken)
        navigate("/d")
      } else {
        console.error("Access Token not found in response")
      }
    } catch (error: any) {
      console.error("Signup Error:", error.response?.data || error.message)
    }
  }

  return (
    <div className="grid grid-cols-2 h-screen">
      <div className="bg-black"></div>
      <div className="flex justify-center">
        <Tabs defaultValue="account" className="w-96 h-96 my-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account" className="cursor-pointer">
              Log In
            </TabsTrigger>
            <TabsTrigger value="password" className="cursor-pointer">
              Sign Up
            </TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Log In</CardTitle>
                <CardDescription>
                  Kindly enter your credentials to log in.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="login-username">Username</Label>
                  <Input
                    id="login-username"
                    placeholder="John Doe"
                    value={loginData.username}
                    onChange={(e) =>
                      setLoginData({ ...loginData, username: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="cursor-pointer" onClick={handleLogin}>
                  Confirm
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Signup Tab */}
          <TabsContent value="password">
            <Card>
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                  Enter your credentials to create a new account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input
                    id="signup-username"
                    placeholder="John Doe"
                    value={signupData.username}
                    onChange={(e) =>
                      setSignupData({ ...signupData, username: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({ ...signupData, password: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="signup-confirm-password">
                    Confirm Password
                  </Label>
                  <Input
                    id="signup-confirm-password"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="cursor-pointer"
                  onClick={handleSignup}
                  disabled={signupData.password !== signupData.confirmPassword}
                >
                  Confirm
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
