"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronRight, MapPin, Phone, Mail, Clock, Users, ChevronLeft, Calendar } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"

type ClassSession = {
  name: string
  time: string
  spots: string
  available: boolean
}

type ScheduleDay = {
  day: string
  date: number
  displayDate: string // Added to handle month transitions (e.g. "29", "1")
  status: string
  sessions: ClassSession[]
}

const SCHEDULE_DATA: ScheduleDay[] = [
  { 
    day: "Mon", 
    date: 29,
    displayDate: "29", 
    status: "2 slots", 
    sessions: [
      { name: "Morning Stretch", time: "07:00 - 08:00", spots: "15/20", available: true },
      { name: "Power Pilates", time: "18:00 - 19:00", spots: "12/20", available: true }
    ] 
  },
  { 
    day: "Tue", 
    date: 30,
    displayDate: "30", 
    status: "Unavailable", 
    sessions: [] 
  },
  { 
    day: "Wed", 
    date: 1,
    displayDate: "1", 
    status: "2 slots", 
    sessions: [
      { name: "Reformer", time: "09:00 - 10:00", spots: "0/20", available: true },
      { name: "Mat", time: "17:00 - 18:00", spots: "0/20", available: true }
    ]
  },
  { 
    day: "Thu", 
    date: 2,
    displayDate: "2", 
    status: "2 slots", 
    sessions: [
      { name: "Reformer", time: "09:00 - 10:00", spots: "2/20", available: true },
      { name: "Mat", time: "18:00 - 19:00", spots: "5/20", available: true }
    ]
  },
  { 
    day: "Fri", 
    date: 3,
    displayDate: "3", 
    status: "2 slots", 
    sessions: [
      { name: "Pilates Flow", time: "12:00 - 13:00", spots: "10/20", available: true },
      { name: "Evening Unwind", time: "19:00 - 20:00", spots: "8/20", available: true }
    ]
  },
  { 
    day: "Sat", 
    date: 4,
    displayDate: "4", 
    status: "Unavailable", 
    sessions: [] 
  },
  { 
    day: "Sun", 
    date: 5,
    displayDate: "5", 
    status: "Unavailable", 
    sessions: [] 
  },
]

function BookingPageSection() {
  const [activeTab, setActiveTab] = useState<"schedule" | "pricing" | "contact">("schedule")
  const [selectedDate, setSelectedDate] = useState<number>(1) // Default to Wed 1st
  
  const selectedDayData = SCHEDULE_DATA.find(d => d.date === selectedDate)

  return (
    <section className="bg-background py-20">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-medium tracking-[-0.05em] sm:text-4xl"
          >
            Your booking page with class schedule, appointments, and pricing
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-muted-foreground"
          >
            Share what you do, when you're available, and how to book—all in one
            public profile. Clients can explore your services, join classes,
            purchase plans, and book instantly.
          </motion.p>

          {/* Interactive Hint */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 flex justify-center"
          >
            <div className="flex items-center gap-2 rounded-full bg-foreground/5 px-4 py-2 text-xs font-medium text-muted-foreground backdrop-blur-sm border border-foreground/10">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
              </span>
              Interactive Demo
            </div>
          </motion.div>
        </div>

        {/* Device Mockup */}
        <div className="mt-12 flex justify-center">
          <div className="relative w-full max-w-5xl">
            {/* Device Frame */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} // Custom bezier for premium feel
              className="relative mx-auto rounded-[2rem] border-8 border-foreground/10 bg-foreground/5 p-2 shadow-2xl"
            >
              {/* Device Screen */}
              <div className="relative overflow-hidden rounded-[1.5rem] bg-background">
                {/* Header Banner */}
                <div 
                  className="relative h-32 w-full bg-muted bg-cover bg-center"
                  style={{
                    backgroundImage: 'url(https://gbrvxbmbemvhajerdixh.supabase.co/storage/v1/object/public/Branding/Images/jared-rice-8w7b4SdhOgw-unsplash.jpg)'
                  }}
                >
                  <div className="absolute right-4 top-4 flex items-center gap-2">
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="rounded-full bg-background/80 p-2 backdrop-blur-sm"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1.5 text-xs font-medium backdrop-blur-sm"
                    >
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Log in
                    </motion.button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Studio Profile */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted overflow-hidden">
                      <Image
                        src="https://gbrvxbmbemvhajerdixh.supabase.co/storage/v1/object/public/Branding/Logo/symbol%20grey.svg"
                        alt="Studio Logo"
                        width={45}
                        height={45}
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold">Flow Pilates</h3>
                        <svg
                          className="h-4 w-4 text-blue-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Strength meets flow.
                      </p>
                    </div>
                  </div>

                  {/* Navigation Tabs */}
                  <div className="mt-6 flex gap-6 border-b border-border relative">
                    {["schedule", "pricing", "contact"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`relative pb-2 text-sm font-medium transition-colors ${
                          activeTab === tab
                            ? "text-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {activeTab === tab && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="mt-6 min-h-[400px]">
                    <AnimatePresence mode="wait">
                      {activeTab === "schedule" && (
                        <motion.div
                          key="schedule"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="mb-4 flex items-center justify-between">
                            <h4 className="text-sm font-medium">June 29 - July 5</h4>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <button className="rounded-full p-1 hover:bg-muted hover:text-foreground transition-colors">
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                              <button className="rounded-full p-1 hover:bg-muted hover:text-foreground transition-colors">
                                <Calendar className="h-4 w-4" />
                              </button>
                              <button className="rounded-full p-1 hover:bg-muted hover:text-foreground transition-colors">
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Weekly Schedule */}
                          <div className="mb-6 grid grid-cols-7 gap-2">
                            {SCHEDULE_DATA.map((item, i) => (
                              <motion.div
                                key={`${item.day}-${item.date}`}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => setSelectedDate(item.date)}
                                className={`rounded-lg border p-2 text-center cursor-pointer transition-colors ${
                                  selectedDate === item.date 
                                    ? "border-transparent bg-muted" 
                                    : "border-border/50 hover:bg-muted/50"
                                }`}
                              >
                                <div className="text-xs text-muted-foreground">
                                  {item.day}
                                </div>
                                <div className="mt-1 text-sm font-medium">
                                  {item.displayDate}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {item.status === "Unavailable" ? (
                                    <span className="text-muted-foreground/60">
                                      Unavailable
                                    </span>
                                  ) : (
                                    <span className="flex items-center justify-center gap-1">
                                      <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                                      {item.sessions.length > 0 ? `${item.sessions.length} slots` : item.status}
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          {/* Class Listings */}
                          <div className="space-y-6">
                            <AnimatePresence mode="wait">
                              {selectedDayData?.sessions && selectedDayData.sessions.length > 0 ? (
                                <motion.div
                                  key={selectedDate}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="space-y-6"
                                >
                                  {selectedDayData.sessions.map((session, index) => (
                                    <motion.div 
                                      key={`${session.name}-${index}`}
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: index * 0.1 }}
                                      className="group"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1 space-y-2">
                                          <h4 className="text-sm font-medium leading-none">
                                            {session.name}
                                          </h4>
                                          
                                          <div className="flex items-center gap-6 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                              <Clock className="h-3.5 w-3.5" />
                                              <span>{session.time}</span>
                                            </div>
                                            
                                            <div className="flex items-center gap-1.5">
                                              <MapPin className="h-3.5 w-3.5" />
                                              <span>Flow Pilates</span>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                              <Users className="h-3.5 w-3.5" />
                                              <span>{session.spots}</span>
                                            </div>
                                          </div>
                                        </div>

                                        <motion.button 
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          className="h-8 rounded-full bg-muted px-5 text-xs font-medium transition-colors hover:bg-foreground hover:text-background"
                                        >
                                          Book
                                        </motion.button>
                                      </div>
                                      {/* Separator line except for last item */}
                                      {index < (selectedDayData.sessions.length - 1) && (
                                        <div className="mt-6 h-px w-full bg-border/50" />
                                      )}
                                    </motion.div>
                                  ))}
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="empty"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground"
                                >
                                  <p>No classes available for this date.</p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      )}

                      {/* Pricing Content */}
                      {activeTab === "pricing" && (
                        <motion.div
                          key="pricing"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-4"
                        >
                          {/* Monthly Subscription */}
                          <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center gap-4 rounded-xl p-2 hover:bg-muted/50 cursor-pointer transition-colors"
                          >
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                              <Image
                                src="https://gbrvxbmbemvhajerdixh.supabase.co/storage/v1/object/public/Branding/Images/jared-rice-8w7b4SdhOgw-unsplash.jpg"
                                alt="Monthly subscription"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">
                                Monthly subscription
                              </h4>
                              <p className="mt-1 text-sm font-medium">
                                €80.00 every month
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                All yoga classes. Charged every month. Cancel anytime.
                              </p>
                            </div>
                            <motion.button 
                              whileTap={{ scale: 0.9 }}
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </motion.button>
                          </motion.div>

                          {/* 10 Group Sessions */}
                          <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center gap-4 rounded-xl p-2 hover:bg-muted/50 cursor-pointer transition-colors"
                          >
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                              <Image
                                src="https://gbrvxbmbemvhajerdixh.supabase.co/storage/v1/object/public/Branding/Images/jared-rice-8w7b4SdhOgw-unsplash.jpg"
                                alt="10 Group sessions"
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">
                                10 Group sessions
                              </h4>
                              <p className="mt-1 text-sm font-medium">
                                €100.00
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Attend any Yoga class, 10 sessions total. Valid for 1 month.
                              </p>
                            </div>
                            <motion.button 
                              whileTap={{ scale: 0.9 }}
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </motion.button>
                          </motion.div>
                        </motion.div>
                      )}

                      {/* Contact Content */}
                      {activeTab === "contact" && (
                        <motion.div
                          key="contact"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-6"
                        >
                          {/* Location */}
                          <motion.div 
                            whileHover={{ x: 5 }}
                            className="flex items-start gap-4"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                              <MapPin className="h-5 w-5 text-foreground/60" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">Location</h4>
                              <p className="mt-1 text-xs text-muted-foreground">
                                123 Wellness Street<br />
                                Downtown District<br />
                                City, State 12345
                              </p>
                            </div>
                          </motion.div>

                          {/* Phone */}
                          <motion.div 
                            whileHover={{ x: 5 }}
                            className="flex items-start gap-4"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                              <Phone className="h-5 w-5 text-foreground/60" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">Phone</h4>
                              <p className="mt-1 text-xs text-muted-foreground">
                                <a
                                  href="tel:+1234567890"
                                  className="hover:text-foreground transition-colors"
                                >
                                  +1 (234) 567-890
                                </a>
                              </p>
                            </div>
                          </motion.div>

                          {/* Email */}
                          <motion.div 
                            whileHover={{ x: 5 }}
                            className="flex items-start gap-4"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                              <Mail className="h-5 w-5 text-foreground/60" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">Email</h4>
                              <p className="mt-1 text-xs text-muted-foreground">
                                <a
                                  href="mailto:hello@flowpilates.com"
                                  className="hover:text-foreground transition-colors"
                                >
                                  hello@flowpilates.com
                                </a>
                              </p>
                            </div>
                          </motion.div>

                          {/* Hours */}
                          <motion.div 
                            whileHover={{ x: 5 }}
                            className="flex items-start gap-4"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                              <Clock className="h-5 w-5 text-foreground/60" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">Hours</h4>
                              <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                                <p>Monday - Friday: 6:00 AM - 9:00 PM</p>
                                <p>Saturday: 7:00 AM - 8:00 PM</p>
                                <p>Sunday: 8:00 AM - 6:00 PM</p>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export { BookingPageSection }
