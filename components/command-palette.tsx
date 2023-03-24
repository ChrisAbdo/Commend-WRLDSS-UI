import { Fragment, useState } from "react";
import { Combobox, Dialog, Transition } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { UsersIcon } from "@heroicons/react/24/outline";
import { ChevronRightIcon } from "@heroicons/react/20/solid";

const people = [
  {
    id: 1,
    name: "Leslie Alexander",
    phone: "1-493-747-9031",
    email: "lesliealexander@example.com",
    role: "Co-Founder / CEO",
    url: "https://example.com",
    profileUrl: "#",
    imageUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  },
];

const recent = [people[0]];

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export default function CommandPalette({ open, setOpen }: any) {
  const [query, setQuery] = useState("");

  const filteredPeople =
    query === ""
      ? []
      : people.filter((person) => {
          return person.name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <Transition.Root
      show={open}
      as={Fragment}
      afterLeave={() => setQuery("")}
      appear
    >
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-3xl transform divide-y divide-[#333] overflow-hidden rounded-xl bg-black border border-[#333] shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
              <Combobox
                //   @ts-ignore
                onChange={(person) => (window.location = person.profileUrl)}
              >
                {({ activeOption }) => (
                  <>
                    <div className="relative">
                      <MagnifyingGlassIcon
                        className="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                      <Combobox.Input
                        className="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                        placeholder="Search..."
                        onChange={(event) => setQuery(event.target.value)}
                      />
                    </div>

                    {(query === "" || filteredPeople.length > 0) && (
                      // @ts-ignore
                      <Combobox.Options
                        as="div"
                        static
                        hold
                        className="flex divide-x divide-[#333]"
                      >
                        <div
                          className={classNames(
                            "max-h-96 min-w-0 flex-auto scroll-py-4 overflow-y-auto px-6 py-4",
                            activeOption && "sm:h-96"
                          )}
                        >
                          {query === "" && (
                            <h2 className="mt-2 mb-4 text-xs font-semibold text-white">
                              Recent searches
                            </h2>
                          )}
                          <div className="-mx-2 text-sm text-gray-700">
                            {(query === "" ? recent : filteredPeople).map(
                              (person) => (
                                <Combobox.Option
                                  as="div"
                                  key={person.id}
                                  value={person}
                                  className={({ active }) =>
                                    classNames(
                                      "flex cursor-default select-none items-center rounded-md p-2",
                                      active && "bg-[#111] text-gray-900"
                                    )
                                  }
                                >
                                  {({ active }) => (
                                    <>
                                      <img
                                        src={person.imageUrl}
                                        alt=""
                                        className="h-6 w-6 flex-none rounded-full"
                                      />
                                      <span className="ml-3 flex-auto truncate text-white">
                                        {person.name}
                                      </span>
                                      {active && (
                                        <ChevronRightIcon
                                          className="ml-3 h-5 w-5 flex-none text-gray-400"
                                          aria-hidden="true"
                                        />
                                      )}
                                    </>
                                  )}
                                </Combobox.Option>
                              )
                            )}
                          </div>
                        </div>

                        {activeOption && (
                          <div className="hidden h-96 w-1/2 flex-none flex-col divide-y divide-[#333] overflow-y-auto sm:flex">
                            <div className="flex-none p-6 text-center">
                              <img
                                // @ts-ignore
                                src={activeOption.imageUrl}
                                alt=""
                                className="mx-auto h-16 w-16 rounded-full"
                              />
                              <h2 className="mt-3 font-semibold text-white">
                                {/* @ts-ignore */}
                                {activeOption.name}
                              </h2>
                              <p className="text-sm leading-6 text-white">
                                {/* @ts-ignore */}
                                {activeOption.role}
                              </p>
                            </div>
                            <div className="flex flex-auto flex-col justify-between p-6">
                              <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm text-gray-700">
                                <dt className="col-end-1 font-semibold text-white">
                                  Phone
                                </dt>
                                <dd className="text-[#999]">
                                  {/* @ts-ignore */}
                                  {activeOption.phone}
                                </dd>
                                <dt className="col-end-1 font-semibold text-white">
                                  URL
                                </dt>
                                <dd className="truncate">
                                  <a
                                    // @ts-ignore
                                    href={activeOption.url}
                                    className="text-indigo-600 underline"
                                  >
                                    {/* @ts-ignore */}
                                    {activeOption.url}
                                  </a>
                                </dd>
                                <dt className="col-end-1 font-semibold text-white">
                                  Email
                                </dt>
                                <dd className="truncate">
                                  <a
                                    // @ts-ignore
                                    href={`mailto:${activeOption.email}`}
                                    className="text-indigo-600 underline"
                                  >
                                    {/* @ts-ignore */}
                                    {activeOption.email}
                                  </a>
                                </dd>
                              </dl>
                              <button
                                type="button"
                                className="mt-6 w-full rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                              >
                                Send message
                              </button>
                            </div>
                          </div>
                        )}
                      </Combobox.Options>
                    )}

                    {query !== "" && filteredPeople.length === 0 && (
                      <div className="py-14 px-6 text-center text-sm sm:px-14">
                        <UsersIcon
                          className="mx-auto h-6 w-6 text-gray-400"
                          aria-hidden="true"
                        />
                        <p className="mt-4 font-semibold text-gray-900">
                          No people found
                        </p>
                        <p className="mt-2 text-gray-500">
                          We couldn’t find anything with that term. Please try
                          again.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </Combobox>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
