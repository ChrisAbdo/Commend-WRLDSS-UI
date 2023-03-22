import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "framer-motion";

import {
  CloudArrowUpIcon,
  LockClosedIcon,
  ServerIcon,
} from "@heroicons/react/20/solid";

const features = [
  {
    name: "Mint a profile.",
    description:
      "In less than 1 minute, you can mint a Commend profile. This profile will be used to store your reputation and commends.",
    icon: CloudArrowUpIcon,
  },
  {
    name: "Give and receive commends.",
    description:
      "You can give anyone who has a Commend profile a commend. You can also receive commends from anyone with a valid Ethereum address/wallet.",
    icon: LockClosedIcon,
  },
  {
    name: "Explore Commenders.",
    description:
      "View all the commenders on Commend. You can also view the commends they have given and received.",
    icon: ServerIcon,
  },
];

export default function PreviewProject() {
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1.5 } },
  };
  return (
    <>
      <div className="overflow-hidden bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl md:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-y-16 gap-x-8 sm:gap-y-20 lg:grid-cols-2 lg:items-start">
            <div className="px-6 lg:px-0 lg:pt-4 lg:pr-4">
              <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-lg">
                <h2 className="text-base font-semibold leading-7 text-indigo-600">
                  The Easiest On Chain Reputation System
                </h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Show communities who you are.
                </p>
                <p className="mt-6 text-lg leading-8 text-black">
                  Commend is a decentralized reputation system built on Polygon.
                  It allows you to build a reputation on-chain. This means that
                  your reputation is availble for anyone to see. You can use
                  Commend to show your reputation to communities, employers, or
                  anyone else.
                </p>
                <dl
                  className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none"
                  ref={ref}
                >
                  {features.map((feature) => (
                    <AnimatePresence key={feature.name}>
                      {inView && (
                        <motion.div
                          key={feature.name}
                          className="relative pl-9"
                          variants={fadeIn}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                        >
                          <dt className="inline font-semibold text-gray-900">
                            <feature.icon
                              className="absolute top-1 left-1 h-5 w-5 text-indigo-600"
                              aria-hidden="true"
                            />
                            {feature.name}
                          </dt>{" "}
                          <dd className="inline">{feature.description}</dd>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ))}
                </dl>
              </div>
            </div>

            <div className="sm:px-6 lg:px-0">
              <div className="relative isolate overflow-hidden bg-black px-6 pt-8 sm:mx-auto sm:max-w-2xl sm:rounded-3xl sm:pt-16 sm:pl-16 sm:pr-0 lg:mx-0 lg:max-w-none">
                <div
                  className="absolute -inset-y-px -left-3 -z-10 w-full origin-bottom-left skew-x-[-30deg] bg-indigo-100 opacity-20 ring-1 ring-inset ring-white"
                  aria-hidden="true"
                />
                <div className="mx-auto max-w-2xl sm:mx-0 sm:max-w-none">
                  <img
                    src="https://tailwindui.com/img/component-images/project-app-screenshot.png"
                    className="-mb-12 w-[57rem] max-w-none rounded-tl-xl bg-gray-800 ring-1 ring-white/10"
                    width={2432}
                    height={1442}
                  />
                </div>
                <div
                  className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/10 sm:rounded-3xl"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
