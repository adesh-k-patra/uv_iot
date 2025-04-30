import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import axios from "axios"
interface Device {
  device_id: string
  name: string
}
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

export default function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([])
  const [readings, setReadings] = useState<
    { date: string; on_time: string; uv_index: number; sanitation: string }[]
  >([])
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)

  const [uuid, setUuid] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleAddDevice = async () => {
    setIsLoading(true)
    try {
      await axios.post(
        BACKEND_URL + "/v1/device/add",
        { uuid, name },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      )
      alert("Device added successfully!")
      setSelectedDevice({
        device_id: uuid,
        name: name,
      })
      await fetchReadings(uuid)
      setUuid("") // Reset input
      setName("")
    } catch (error: any) {
      console.error("Error adding device:", error.response?.data || error)
      alert("Failed to add device. Please check the UUID or try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDevices = async () => {
    try {
      const response = await axios.get(BACKEND_URL + "/v1/device/all", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
      console.log(response.data.data.devices[0].device_id)
      if (response.data.data.devices.length > 0) {
        console.log(response.data.data.devices)
        setDevices(response.data.data.devices)
        setSelectedDevice(response.data.data.devices[0]) // Select first device
        fetchReadings(response.data.data.devices[0].device_id) // Initial fetch
      }
    } catch (error) {
      console.error("Error fetching devices:", error)
    }
  }

  const fetchReadings = async (deviceId: string) => {
    try {
      const response = await axios.get(
        BACKEND_URL + `/v1/reading/one/${deviceId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      )
      console.log("fetched")
      console.log(response)
      // setReadings(response.data?.data?.readings) // Store readings in state

      const readings = response.data?.data?.readings || []

      // Sort readings by created_at in ascending order (oldest first)
      const sortedReadings = readings.sort(
        (a: { created_at: string }, b: { created_at: string }) => {
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          )
        }
      )

      // If you want newest first, just reverse the subtraction
      // const sortedReadings = readings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      setReadings(sortedReadings) // Set sorted readings
    } catch (error) {
      console.error("Error fetching readings:", error)
    }
  }

  // Fetch devices once when component mounts
  useEffect(() => {
    fetchDevices()
  }, [])

  // Poll readings every second once a device is selected
  useEffect(() => {
    if (!selectedDevice) return

    const interval = setInterval(() => {
      fetchReadings(selectedDevice.device_id)
    }, 1000)

    return () => clearInterval(interval) // Clear interval on unmount or selectedDevice change
  }, [selectedDevice])

  // useEffect(() => {
  //   const fetchDevices = async () => {
  //     try {
  //       const response = await axios.get(
  //         "http://localhost:3000/v1/device/all",
  //         {
  //           headers: {
  //             Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  //           },
  //         }
  //       )
  //       console.log(response.data.data.devices[0].device_id)
  //       if (response.data.data.devices.length > 0) {
  //         console.log(response.data.data.devices)
  //         setDevices(response.data.data.devices)
  //         setSelectedDevice(response.data.data.devices[0]) // Select first device
  //         fetchReadings(response.data.data.devices[0].device_id) // Fetch readings for first device
  //       }
  //     } catch (error) {
  //       console.error("Error fetching devices:", error)
  //     }
  //   }
  //   fetchDevices()
  // }, [])

  // const fetchReadings = async (deviceId) => {
  //   try {
  //     const response = await axios.get(
  //       `http://localhost:3000/v1/reading/one/${deviceId}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
  //         },
  //       }
  //     )
  //     console.log(response)
  //     setReadings(response.data?.data?.readings) // Store readings in state
  //   } catch (error) {
  //     console.error("Error fetching readings:", error)
  //   }
  // }

  return (
    <div style={{ backgroundColor: "#f5f5f7" }}>
      <div
        className="h-16 flex px-12 space-x-2"
        style={{ backgroundColor: "#181818" }}
      >
        <div className="w-3/12 flex items-center">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="bg-[#d1d1d1] hover:bg-white my-auto cursor-pointer"
                onClick={() => setIsSheetOpen(true)}
              >
                Change Device
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="grid gap-4 pt-12 text-center text-2xl">
                Avaliable Devices
              </div>
              <div className="flex justify-center">
                <ScrollArea className="h-[37rem] w-11/12">
                  {/* <div className="p-4">
                    {tags1.map((tag) => (
                      <>
                        <div key={tag}>{tag}</div>
                      </>
                    ))}
                  </div> */}
                  <div className="p-4">
                    {devices.length > 0 ? (
                      devices.map((device) => (
                        <Card
                          key={device.device_id}
                          className="w-full my-4 mx-auto cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md"
                          onClick={async () => {
                            setSelectedDevice({
                              device_id: device.device_id,
                              name: device.name,
                            })
                            await fetchReadings(device.device_id)
                            setIsSheetOpen(false)
                          }}
                        >
                          <CardHeader>
                            <CardTitle>Device Name: {device.name}</CardTitle>
                            <CardDescription>
                              UUID Number: {device.device_id}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      ))
                    ) : (
                      <p className="text-center">No devices found</p>
                    )}
                  </div>
                </ScrollArea>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-56 mx-auto h-12 my-auto cursor-pointer">
                    Add New Device
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Device</DialogTitle>
                    <DialogDescription>
                      Enter UUID number of your UV IoT device to access the live
                      readings.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-6 items-center gap-4">
                      <Label htmlFor="name" className="text-left col-span-2">
                        UUID Number
                      </Label>
                      <Input
                        id="uuid"
                        placeholder="Type here..."
                        className="col-span-4"
                        value={uuid}
                        onChange={(e) => setUuid(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-6 items-center gap-4">
                      <Label
                        htmlFor="username"
                        className="text-left col-span-2"
                      >
                        Device Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Type here..."
                        className="col-span-4"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      onClick={handleAddDevice}
                      disabled={isLoading}
                      className="cursor-pointer"
                    >
                      Save changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              {/* <SheetFooter>
                <SheetClose asChild>
                  <Button type="submit">Save changes</Button>
                </SheetClose>
              </SheetFooter> */}
            </SheetContent>
          </Sheet>
        </div>
        <div
          className="w-9/12 flex justify-center space-x-16"
          style={{ color: "#d1d1d1" }}
        >
          <div className="my-auto hover:text-white cursor-pointer text-sm">
            Dashboard
          </div>
          <div className="my-auto hover:text-white cursor-pointer text-sm">
            Spectate
          </div>
          <div className="my-auto hover:text-white cursor-pointer text-sm">
            Leave Remarks
          </div>
          <div className="my-auto hover:text-white cursor-pointer text-sm">
            Profile
          </div>
        </div>
      </div>
      <div className="mx-10 grid grid-cols-12 my-6">
        <Card className="col-span-3 mx-6 cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md">
          <CardHeader>
            <CardTitle>Device Name: {selectedDevice?.name || ""}</CardTitle>
            <CardDescription>
              UUID Number: {selectedDevice?.device_id || ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="bg-indigo-50 text-black border-black border-1 hover:bg-indigo-200 cursor-pointer">
              Know More
            </Button>
          </CardContent>
        </Card>
        <Card className="col-span-2 mx-6 cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-center">
              No. of times used today
            </CardTitle>
            <CardDescription className="text-[60px] text-center text-black pt-2">
              {" "}
              4{" "}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="col-span-2 mx-6 cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-center">
              Duration used today (mins)
            </CardTitle>
            <CardDescription className="text-[60px] text-center text-black pt-2">
              12
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="col-span-2 mx-6 cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-center">
              Total no.of times used
            </CardTitle>
            <CardDescription className="text-[60px] text-center text-black pt-2">
              10
            </CardDescription>
          </CardHeader>
        </Card>
        <Card className="col-span-2 mx-6 cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md">
          <CardHeader>
            <CardTitle className="text-center">
              Total duration used (mins)
            </CardTitle>
            <CardDescription className="text-[60px] text-center text-black pt-2">
              30
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      <Table
        className="w-10/12 mx-16 mb-12"
        style={{ backgroundColor: "#ffffff" }}
      >
        <TableHeader className="bg-indigo-50 border-black hover:bg-indigo-200 cursor-pointer">
          <TableRow className="hover:bg-indigo-200">
            <TableHead className="text-center">Date</TableHead>
            <TableHead className="text-center">ON Time</TableHead>
            {/* <TableHead className="text-center">OFF Time</TableHead> */}
            <TableHead className="text-center">
              UV Index recorded (latest)
            </TableHead>
            <TableHead className="text-center">% Sanitation achieved</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="cursor-pointer">
          {/* {datas.map((data) => (
            <TableRow
              key={data.key}
              className="transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md"
            >
              <TableCell className="text-center">{data.date}</TableCell>
              <TableCell className="text-center">{data.onTime}</TableCell>
              <TableCell className="text-center">{data.offTime}</TableCell>
              <TableCell className="text-center">{data.index}</TableCell>
              <TableCell className="text-center">{data.sanitation}</TableCell>
            </TableRow>
          ))} */}
          {readings.map((reading, index) => (
            <TableRow key={index}>
              <TableCell className="text-center">{reading.date}</TableCell>
              <TableCell className="text-center">{reading.on_time}</TableCell>
              {/* <TableCell className="text-center">{reading.off_time}</TableCell> */}
              <TableCell className="text-center">{reading.uv_index}</TableCell>
              <TableCell className="text-center">
                {reading.sanitation}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// import { useState, useEffect } from "react"
// import axios from "axios"
// import { Button } from "@/components/ui/button"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card"
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// export default function Dashboard() {
//   const [devices, setDevices] = useState([])
//   const [readings, setReadings] = useState([])
//   const [selectedDevice, setSelectedDevice] = useState(null)

//   useEffect(() => {
//     const fetchDevices = async () => {
//       try {
//         const response = await axios.get(
//           "http://localhost:3000/v1/device/all",
//           {
//             headers: {
//               Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//             },
//           }
//         )

//         if (response.data.length > 0) {
//           setDevices(response.data)
//           setSelectedDevice(response.data[0]) // Select first device
//           fetchReadings(response.data[0].device_id) // Fetch readings for first device
//         }
//       } catch (error) {
//         console.error("Error fetching devices:", error)
//       }
//     }
//     n
//     fetchDevices()
//   }, [])

//   const fetchReadings = async (deviceId) => {
//     try {
//       const response = await axios.get(
//         `http://localhost:3000/v1/reading/one/${deviceId}`,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//           },
//         }
//       )

//       setReadings(response.data) // Store readings in state
//     } catch (error) {
//       console.error("Error fetching readings:", error)
//     }
//   }

//   return (
//     <div style={{ backgroundColor: "#f5f5f7" }}>
//       <div
//         className="h-16 flex px-12 space-x-2"
//         style={{ backgroundColor: "#181818" }}
//       >
//         <div className="w-3/12 flex items-center">
//           <Sheet>
//             <SheetTrigger asChild>
//               <Button
//                 variant="outline"
//                 className="bg-[#d1d1d1] hover:bg-white my-auto cursor-pointer"
//               >
//                 Change Device
//               </Button>
//             </SheetTrigger>
//             <SheetContent>
//               <div className="grid gap-4 pt-12 text-center text-2xl">
//                 Available Devices
//               </div>
//               <div className="flex justify-center">
//                 <ScrollArea className="h-[37rem] w-11/12">
//                   <div className="p-4">
//                     {devices.length > 0 ? (
//                       devices.map((device) => (
//                         <Card
//                           key={device.device_id}
//                           className="w-full my-4 mx-auto cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md"
//                         >
//                           <CardHeader>
//                             <CardTitle>Device Name: {device.name}</CardTitle>
//                             <CardDescription>
//                               UUID Number: {device.device_id}
//                             </CardDescription>
//                           </CardHeader>
//                         </Card>
//                       ))
//                     ) : (
//                       <p className="text-center">No devices found</p>
//                     )}
//                   </div>
//                 </ScrollArea>
//               </div>
//             </SheetContent>
//           </Sheet>
//         </div>
//       </div>
//     </div>
//   )
// }

// import { Button } from "@/components/ui/button"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"

// const datas = [
//   {
//     date: "25th Mar'25",
//     key: 1,
//     onTime: "8:30 AM",
//     offTime: "10:30 AM",
//     index: "2",
//     sanitation: "45",
//   },
//   {
//     date: "25th Mar'25",
//     key: 2,
//     onTime: "10:40 AM",
//     offTime: "12:10 PM",
//     index: "3",
//     sanitation: "60",
//   },
//   {
//     date: "25th Mar'25",
//     key: 3,
//     onTime: "12:30 PM",
//     offTime: "1:50 PM",
//     index: "2.4",
//     sanitation: "50",
//   },
//   {
//     date: "25th Mar'25",
//     key: 4,
//     onTime: "2:10 PM",
//     offTime: "3:30 PM",
//     index: "2.6",
//     sanitation: "49",
//   },
//   {
//     date: "25th Mar'25",
//     key: 5,
//     onTime: "3:55 PM",
//     offTime: "5:30 PM",
//     index: "3.5",
//     sanitation: "71",
//   },
//   {
//     date: "25th Mar'25",
//     key: 6,
//     onTime: "6:00 PM",
//     offTime: "10:00 PM",
//     index: "2.2",
//     sanitation: "41",
//   },
//   {
//     date: "26th Mar'25",
//     key: 7,
//     onTime: "00:10 AM",
//     offTime: "1:30 AM",
//     index: "2.4",
//     sanitation: "47",
//   },
//   {
//     date: "26th Mar'25",
//     key: 8,
//     onTime: "3:30 AM",
//     offTime: "6:30 AM",
//     index: "5",
//     sanitation: "82",
//   },
//   {
//     date: "26th Mar'25",
//     key: 9,
//     onTime: "8:30 AM",
//     offTime: "10:10 AM",
//     index: "5",
//     sanitation: "52",
//   },
//   {
//     date: "26th Mar'25",
//     key: 10,
//     onTime: "10:50 AM",
//     offTime: "12:10 PM",
//     index: "2.7",
//     sanitation: "51",
//   },
// ]

// const tags1 = [
//   <Card
//     key="1"
//     className="w-full my-4 mx-auto cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md"
//   >
//     <CardHeader>
//       <CardTitle>Device Name: IoT 1</CardTitle>
//       <CardDescription>
//         UUID Number: 37acd90c-5c56-49eb-92ce-83789fbd985e
//       </CardDescription>
//     </CardHeader>
//   </Card>,
//   <Card
//     key="2"
//     className="w-full my-4 mx-auto cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md"
//   >
//     <CardHeader>
//       <CardTitle>Device Name: IoT 2</CardTitle>
//       <CardDescription>
//         UUID Number: 89adcf34-bcde-4321-abcd-1234567890ef
//       </CardDescription>
//     </CardHeader>
//   </Card>,
//   <Card
//     key="3"
//     className="w-full my-4 mx-auto cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md"
//   >
//     <CardHeader>
//       <CardTitle>Device Name: IoT 2</CardTitle>
//       <CardDescription>
//         UUID Number: 89adcf34-bcde-4321-abcd-1234567890ef
//       </CardDescription>
//     </CardHeader>
//   </Card>,
//   <Card
//     key="4"
//     className="w-full my-4 mx-auto cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md"
//   >
//     <CardHeader>
//       <CardTitle>Device Name: IoT 2</CardTitle>
//       <CardDescription>
//         UUID Number: 89adcf34-bcde-4321-abcd-1234567890ef
//       </CardDescription>
//     </CardHeader>
//   </Card>,
//   <Card
//     key="5"
//     className="w-full my-4 mx-auto cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md"
//   >
//     <CardHeader>
//       <CardTitle>Device Name: IoT 2</CardTitle>
//       <CardDescription>
//         UUID Number: 89adcf34-bcde-4321-abcd-1234567890ef
//       </CardDescription>
//     </CardHeader>
//   </Card>,
// ]

// export default function Dashboard() {
//   return (
//     <div style={{ backgroundColor: "#f5f5f7" }}>
//       <div
//         className="h-16 flex px-12 space-x-2"
//         style={{ backgroundColor: "#181818" }}
//       >
//         <div className="w-3/12 flex items-center">
//           <Sheet>
//             <SheetTrigger asChild>
//               <Button
//                 variant="outline"
//                 className="bg-[#d1d1d1] hover:bg-white my-auto cursor-pointer"
//               >
//                 Change Device
//               </Button>
//             </SheetTrigger>
//             <SheetContent>
//               <div className="grid gap-4 pt-12 text-center text-2xl">
//                 Avaliable Devices
//               </div>
//               <div className="flex justify-center">
//                 <ScrollArea className="h-[37rem] w-11/12">
//                   <div className="p-4">
//                     {tags1.map((tag) => (
//                       <>
//                         <div key={tag}>{tag}</div>
//                       </>
//                     ))}
//                   </div>
//                 </ScrollArea>
//               </div>

//               <Dialog>
//                 <DialogTrigger asChild>
//                   <Button className="w-56 mx-auto h-12 my-auto cursor-pointer">
//                     Add New Device
//                   </Button>
//                 </DialogTrigger>
//                 <DialogContent className="sm:max-w-[425px]">
//                   <DialogHeader>
//                     <DialogTitle>Add New Device</DialogTitle>
//                     <DialogDescription>
//                       Enter UUID number of your UV IoT device to access the live
//                       readings.
//                     </DialogDescription>
//                   </DialogHeader>
//                   <div className="grid gap-4 py-4">
//                     <div className="grid grid-cols-6 items-center gap-4">
//                       <Label htmlFor="name" className="text-left col-span-2">
//                         UUID Number
//                       </Label>
//                       <Input
//                         id="name"
//                         placeholder="Type here..."
//                         className="col-span-4"
//                       />
//                     </div>
//                     <div className="grid grid-cols-6 items-center gap-4">
//                       <Label
//                         htmlFor="username"
//                         className="text-left col-span-2"
//                       >
//                         Password
//                       </Label>
//                       <Input
//                         id="username"
//                         className="col-span-4"
//                         type="password"
//                       />
//                     </div>
//                   </div>
//                   <DialogFooter>
//                     <Button type="submit" className="cursor-pointer">
//                       Save changes
//                     </Button>
//                   </DialogFooter>
//                 </DialogContent>
//               </Dialog>
//               {/* <SheetFooter>
//                 <SheetClose asChild>
//                   <Button type="submit">Save changes</Button>
//                 </SheetClose>
//               </SheetFooter> */}
//             </SheetContent>
//           </Sheet>
//         </div>
//         <div
//           className="w-9/12 flex justify-center space-x-16"
//           style={{ color: "#d1d1d1" }}
//         >
//           <div className="my-auto hover:text-white cursor-pointer text-sm">
//             Dashboard
//           </div>
//           <div className="my-auto hover:text-white cursor-pointer text-sm">
//             Spectate
//           </div>
//           <div className="my-auto hover:text-white cursor-pointer text-sm">
//             Leave Remarks
//           </div>
//           <div className="my-auto hover:text-white cursor-pointer text-sm">
//             Profile
//           </div>
//         </div>
//       </div>
//       <div className="mx-10 grid grid-cols-12 my-6">
//         <Card className="col-span-3 mx-6 cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md">
//           <CardHeader>
//             <CardTitle>Device Name: IoT 1</CardTitle>
//             <CardDescription>
//               UUID Number: 37acd90c-5c56-49eb-92ce-83789fbd985e
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Button className="bg-indigo-50 text-black border-black border-1 hover:bg-indigo-200 cursor-pointer">
//               Know More
//             </Button>
//           </CardContent>
//         </Card>
//         <Card className="col-span-2 mx-6 cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md">
//           <CardHeader>
//             <CardTitle className="text-center">
//               No. of times used today
//             </CardTitle>
//             <CardDescription className="text-[60px] text-center text-black pt-2">
//               {" "}
//               7{" "}
//             </CardDescription>
//           </CardHeader>
//         </Card>
//         <Card className="col-span-2 mx-6 cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md">
//           <CardHeader>
//             <CardTitle className="text-center">
//               Duration used today (mins)
//             </CardTitle>
//             <CardDescription className="text-[60px] text-center text-black pt-2">
//               10
//             </CardDescription>
//           </CardHeader>
//         </Card>
//         <Card className="col-span-2 mx-6 cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md">
//           <CardHeader>
//             <CardTitle className="text-center">
//               Total no.of times used
//             </CardTitle>
//             <CardDescription className="text-[60px] text-center text-black pt-2">
//               2
//             </CardDescription>
//           </CardHeader>
//         </Card>
//         <Card className="col-span-2 mx-6 cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md">
//           <CardHeader>
//             <CardTitle className="text-center">
//               Total duration used (mins)
//             </CardTitle>
//             <CardDescription className="text-[60px] text-center text-black pt-2">
//               12
//             </CardDescription>
//           </CardHeader>
//         </Card>
//       </div>
//       <Table
//         className="w-10/12 mx-16 mb-12"
//         style={{ backgroundColor: "#ffffff" }}
//       >
//         <TableHeader className="bg-indigo-50 border-black hover:bg-indigo-200 cursor-pointer">
//           <TableRow className="hover:bg-indigo-200">
//             <TableHead className="text-center">Date</TableHead>
//             <TableHead className="text-center">ON Time</TableHead>
//             <TableHead className="text-center">OFF Time</TableHead>
//             <TableHead className="text-center">UV Index emitted</TableHead>
//             <TableHead className="text-center">% Sanitation achieved</TableHead>
//           </TableRow>
//         </TableHeader>
//         <TableBody className="cursor-pointer">
//           {datas.map((data) => (
//             <TableRow
//               key={data.key}
//               className="transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-md"
//             >
//               <TableCell className="text-center">{data.date}</TableCell>
//               <TableCell className="text-center">{data.onTime}</TableCell>
//               <TableCell className="text-center">{data.offTime}</TableCell>
//               <TableCell className="text-center">{data.index}</TableCell>
//               <TableCell className="text-center">{data.sanitation}</TableCell>
//             </TableRow>
//           ))}
//         </TableBody>
//       </Table>
//     </div>
//   )
// }
