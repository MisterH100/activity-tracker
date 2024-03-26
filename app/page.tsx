"use client";
import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlusCircleIcon, MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface IActivity {
  _id: string;
  title: string;
  description: string;
  start_date: Date;
  end_date: Date;
  duration: string;
}
export default function Home() {
  const { setTheme, theme } = useTheme();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [activities, setActivities] = useState<IActivity[]>([]);
  const [completeActivities, setCompleteActivities] = useState<IActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const getActivities = async () => {
    setLoading(true);
    const response = await fetch(
      "https://nodeserver-v2.onrender.com/api/activities",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    setActivities(data.filter((item: IActivity) => item.end_date == null));
    setCompleteActivities(
      data.filter((item: IActivity) => item.end_date != null)
    );
    setLoading(false);
  };

  const startActivity = async () => {
    setLoading(true);
    await fetch("https://nodeserver-v2.onrender.com/api/activity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: title, description: description }),
    }).then(() => {
      getActivities();
    });
    setTitle("");
    setDescription("");
    setLoading(false);
  };

  const endActivity = async (id: string) => {
    setLoading(true);
    await fetch(`https://nodeserver-v2.onrender.com/api/activity/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(() => {
      getActivities();
    });
    setLoading(false);
  };
  const calculateDuration = (end: Date, start: Date) => {
    const startDate = new Date(start).getTime();
    const endDate = new Date(end).getTime();
    const timeDifferenceMS = endDate - startDate;
    const seconds = Math.floor(timeDifferenceMS / 1000);
    const minutes = Math.floor(
      (timeDifferenceMS % (1000 * 60 * 60)) / (1000 * 60)
    );
    const hours = Math.floor(timeDifferenceMS / (1000 * 60 * 60));
    const days = Math.floor(timeDifferenceMS / (1000 * 60 * 60 * 24));
    if (hours > 23) {
      return `${days} days`;
    }
    if (hours < 1) {
      return `${minutes} minutes`;
    }
    return `${hours} hours ${minutes} minutes`;
  };

  const formatTime = (date: Date) => {
    const offsetMinutes = new Date(date).getTimezoneOffset();
    const milliseconds = new Date(date).getTime();
    const localTime = milliseconds - offsetMinutes * 60 * 1000;
    const seconds = Math.floor((localTime / 1000) % 60);
    const minutes = Math.floor((localTime / 1000 / 60) % 60);
    const hours = Math.floor((localTime / 1000 / 60 / 60) % 24);

    return `${hours < 10 ? "0" : ""}${hours}:${
      minutes < 10 ? "0" : ""
    }${minutes} ${hours >= 12 ? "pm" : "am"}`;
  };

  const formatDate = (date: Date) => {
    return ` ${days[date.getDay()]} ${date.getDate()} ${
      months[date.getMonth()]
    }`;
  };

  useEffect(() => {
    getActivities();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between px-4 md:px-10">
      <section className="relative w-full md:w-[600px] min-h-screen border border-border px-4">
        {loading && <div className="loaderBar"></div>}
        <Card className="border-none">
          <CardHeader className="flex-row justify-between px-0">
            <div>
              <CardTitle>Productivity Tracker</CardTitle>
              <CardDescription>
                Today:{formatDate(new Date(Date.now()))}
              </CardDescription>
            </div>
            <div>
              <Button
                onClick={() => setTheme(theme == "light" ? "dark" : "light")}
                variant="outline"
              >
                {theme == "light" ? <SunIcon /> : <MoonIcon />}
              </Button>
            </div>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-none px-0">
          <CardContent className="px-0">
            <CardTitle className="text-base">Add new activity</CardTitle>
            <div className="flex gap-2 mt-2">
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Activity Title"
                maxLength={100}
                className="rounded-md"
              />
              <Dialog>
                <DialogTrigger
                  className={`${buttonVariants({
                    variant: "outline",
                  })} rounded-full `}
                >
                  <PlusCircleIcon />
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Activity</DialogTitle>
                  </DialogHeader>
                  <Input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Activity Title"
                    maxLength={100}
                    className="rounded-full"
                  />
                  <Input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Activity Description"
                    maxLength={200}
                    className="h-20"
                  />
                  <DialogFooter>
                    <DialogClose
                      className={`${buttonVariants({
                        variant: "default",
                      })} rounded-full text-white`}
                      onClick={startActivity}
                    >
                      Start activity
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
        <p className="w-full text-sm text-center text-muted-foreground my-2">
          Recent
        </p>
        <div className="flex flex-col gap-4">
          {activities.map((activity) => (
            <Card key={activity._id}>
              <CardHeader className="flex-row justify-between">
                <div>
                  <CardTitle>{activity.title}</CardTitle>
                  <CardDescription>{activity.description}</CardDescription>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(new Date(activity.start_date))}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <span className="inline-block w-1/2">
                  Started:
                  <span className="pl-2">
                    {formatTime(activity.start_date)}
                  </span>
                </span>
                <span className="inline-block w-1/2 text-right">
                  In progress...
                </span>
              </CardContent>
              <CardFooter>
                <div>
                  <Button
                    onClick={() => {
                      endActivity(activity._id);
                    }}
                    className="rounded-full"
                    variant="destructive"
                  >
                    End activity
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
        <Separator className="my-4" />
        <p className="w-full text-sm text-center text-muted-foreground my-2">
          History
        </p>
        <div className="flex flex-col gap-4">
          {completeActivities.map((item) => (
            <Card key={item._id}>
              <CardHeader className="flex-row justify-between">
                <div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(new Date(item.start_date))}
                  </span>
                </div>
              </CardHeader>
              <CardFooter>
                Duration:
                <span className="pl-2">
                  {calculateDuration(item.end_date, item.start_date)}
                </span>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
