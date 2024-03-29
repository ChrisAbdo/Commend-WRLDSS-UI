import { Fragment, useState, useRef, useEffect } from "react";
import Web3 from "web3";
import Commend from "@/backend/build/contracts/Commend.json";
import NFT from "@/backend/build/contracts/NFT.json";
import axios from "axios";
import { motion } from "framer-motion";
import { Dialog, Transition } from "@headlessui/react";
import CommandPalette from "@/components/command-palette";

import {
  Bars3BottomLeftIcon,
  CalendarIcon,
  ChartBarIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  UsersIcon,
  XMarkIcon,
  WalletIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/20/solid";

const navigation = [
  { name: "Dashboard", href: "#", icon: HomeIcon, current: true },
  { name: "Team", href: "#", icon: UsersIcon, current: false },
  { name: "Projects", href: "#", icon: FolderIcon, current: false },
  { name: "Calendar", href: "#", icon: CalendarIcon, current: false },
  { name: "Documents", href: "#", icon: InboxIcon, current: false },
  { name: "Reports", href: "#", icon: ChartBarIcon, current: false },
];

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Example() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [nfts, setNfts] = useState([]);
  const [commendCount, setCommendCount] = useState(0);
  const [commendDescription, setCommendDescription] = useState("");
  const [query, setQuery] = useState("");
  const [roleQuery, setRoleQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [selectedNFTCommends, setSelectedNFTCommends] = useState(null);
  const [isValid, setIsValid] = useState(false);
  const [open, setOpen] = useState(false);
  const eventDateRef = useRef(new Date());
  const timerRef = useRef(0);

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  const cancelButtonRef = useRef(null);
  const filteredItems =
    query === ""
      ? nfts
      : nfts.filter(
          (item) =>
            // @ts-ignore
            item.seller.toLowerCase().includes(query.toLowerCase()) ||
            // @ts-ignore
            item.role.toLowerCase().includes(query.toLowerCase())
        );

  useEffect(() => {
    loadSongs();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey && event.key === "k") {
        // @ts-ignore
        document.getElementById("search").focus();
        event.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function loadSongs() {
    console.log("Loading songs...");
    // @ts-ignore
    const web3 = new Web3(window.ethereum);

    const networkId = await web3.eth.net.getId();

    // Get all listed NFTs
    const radioContract = new web3.eth.Contract(
      // @ts-ignore
      Commend.abi,
      // @ts-ignore
      Commend.networks[networkId].address
    );
    const listings = await radioContract.methods.getListedNfts().call();

    // Iterate over the listed NFTs and retrieve their metadata
    const nfts = await Promise.all(
      listings.map(async (i: any) => {
        try {
          const NFTContract = new web3.eth.Contract(
            // @ts-ignore
            NFT.abi,
            // @ts-ignore
            NFT.networks[networkId].address
          );
          const tokenURI = await NFTContract.methods.tokenURI(i.tokenId).call();
          const meta = await axios.get(tokenURI);

          const commendationsData = await radioContract.methods
            .getCommendations(i.tokenId)
            .call(); // Fetch commendations for the NFT

          const commendations = commendationsData.map(
            (commendation: any, index: number) => ({
              sender: commendation[0],
              description: commendation[1],
              timestamp: new Date(commendation[2] * 1000),
            })
          );

          console.log("Transformed commendations:", commendations); // Log transformed commendations to console

          const nft = {
            tokenId: i.tokenId,
            seller: i.seller,
            owner: i.buyer,
            role: meta.data.role,
            altName: meta.data.altName,
            coverImage: meta.data.coverImage,
            commendCount: i.commendCount,
            commendations: commendations, // Add commendations to the NFT object
          };
          return nft;
        } catch (err) {
          console.log(err);
          return null;
        }
      })
    );

    // setNfts(nfts.filter((nft) => nft !== null));

    // set nfts in order of heatCount
    const sortedNfts = nfts
      .filter((nft) => nft !== null)
      .sort((a, b) => b.commendCount - a.commendCount);
    const topThreeNfts = sortedNfts.slice(0, 5);

    // @ts-ignore
    setNfts(sortedNfts);
  }

  async function handleGiveHeat(nfts: any) {
    // Get an instance of the Radio contract

    try {
      setLoading(true);
      // @ts-ignore
      const web3 = new Web3(window.ethereum);
      const networkId = await web3.eth.net.getId();
      const radioContract = new web3.eth.Contract(
        // @ts-ignore
        Commend.abi,
        // @ts-ignore
        Commend.networks[networkId].address
      );

      radioContract.methods
        .giveCommend(nfts.tokenId, 1, commendDescription)
        .send({
          // @ts-ignore
          from: window.ethereum.selectedAddress,

          value: web3.utils.toWei("0.0001", "ether"),
        })
        .on("receipt", function () {
          console.log("listed");

          setLoading(false);
        });
    } catch (err) {
      console.log(err);
    }
  }

  function setQueryBySelect(select: any) {
    setQuery(select);
  }

  return (
    <div className="bg-black h-screen">
      <CommandPalette open={open} setOpen={setOpen} />
      <div>
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-40 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </Transition.Child>

            <div className="fixed inset-0 z-40 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                      <button
                        type="button"
                        className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  <div className="flex flex-shrink-0 items-center px-4">
                    <img
                      className="h-8 w-auto"
                      src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                      alt="Your Company"
                    />
                  </div>
                  <div className="mt-5 h-0 flex-1 overflow-y-auto">
                    <nav className="space-y-1 px-2">
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            item.current
                              ? "bg-gray-100 text-gray-900"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                            "group flex items-center rounded-md px-2 py-2 text-base font-medium"
                          )}
                        >
                          <item.icon
                            className={classNames(
                              item.current
                                ? "text-gray-500"
                                : "text-gray-400 group-hover:text-gray-500",
                              "mr-4 h-6 w-6 flex-shrink-0"
                            )}
                            aria-hidden="true"
                          />
                          {item.name}
                        </a>
                      ))}
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
              <div className="w-14 flex-shrink-0" aria-hidden="true">
                {/* Dummy element to force sidebar to shrink to fit close icon */}
              </div>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}

        <div className="flex flex-1 flex-col">
          <main className="flex-1">
            <div className="py-6">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between mt-2 mb-2">
                  <div className="relative flex items-center">
                    <button
                      name="search"
                      id="search"
                      //   onChange={(e) => setQuery(e.target.value)}
                      onClick={() => setOpen(true)}
                      className="block bg-black w-full rounded-md border-0 py-1.5 pr-14 shadow-sm ring-1 ring-inset ring-zinc-700 text-[#999] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    >
                      &nbsp;&nbsp;&nbsp;search for user
                      <div className="absolute inset-y-0 -right-1 flex py-1.5 pr-1.5">
                        <kbd className="inline-flex items-center rounded border border-zinc-700 px-1 font-sans text-xs text-[#777]">
                          ⌘K
                        </kbd>
                      </div>
                    </button>
                  </div>
                  <div className="mb-1"></div>
                </div>

                {query && (
                  <div className="mb-2">
                    <span className="inline-flex items-center rounded-md bg-[#111] py-0.5 pl-2.5 pr-1 text-sm font-medium text-white">
                      {query}
                      <button
                        type="button"
                        onClick={() => setQuery("")}
                        className="ml-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-md text-white hover:bg-[#333] hover:text-white/80 focus:bg-[#333] focus:text-white focus:outline-none"
                      >
                        <svg
                          className="h-2 w-2"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 8 8"
                        >
                          <path
                            strokeLinecap="round"
                            strokeWidth="1.5"
                            d="M1 1l6 6m0-6L1 7"
                          />
                        </svg>
                      </button>
                    </span>
                  </div>
                )}

                <div className="relative">
                  <div
                    className="absolute inset-0 flex items-center"
                    aria-hidden="true"
                  >
                    {/* <div className="w-full border-t border-zinc-700" /> */}
                  </div>
                </div>
              </div>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ">
                {/* Your content */}
                <div className="overflow-hidden bg-black border border-zinc-700 shadow sm:rounded-md ">
                  <ul
                    role="list"
                    className="divide-y divide-zinc-700 rounded-md"
                  >
                    {/* {applications.map((application) => ( */}

                    {filteredItems.length
                      ? filteredItems.map((nft, index) => (
                          <motion.li
                            key={index}
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.1, delay: index * 0.1 }}
                          >
                            <div className="block bg-black hover:bg-[#111] transition-all duration-500">
                              <div className="flex items-center px-4 py-4 sm:px-6">
                                <div className="flex min-w-0 flex-1 items-center">
                                  <div className="flex-shrink-0">
                                    <img
                                      className="h-12 w-12 rounded-md"
                                      //   @ts-ignore
                                      src={nft.coverImage}
                                      alt=""
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                                    <div>
                                      <p className="truncate text-sm font-medium text-white">
                                        {/* @ts-ignore */}
                                        {nft.altName}
                                      </p>
                                      <p className="mt-2 flex items-center text-sm text-white">
                                        <WalletIcon
                                          className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400"
                                          aria-hidden="true"
                                        />
                                        <span className="truncate">
                                          {/* @ts-ignore */}
                                          {nft.seller}
                                        </span>
                                      </p>
                                    </div>
                                    <div className="hidden lg:block">
                                      <span
                                        onClick={() => {
                                          // @ts-ignore
                                          setQuery(nft.role);
                                        }}
                                        className="cursor-pointer inline-flex items-center rounded-md bg-[#333] hover:bg-[#333]/80 transition-all duration-400 px-2.5 py-0.5 text-sm font-medium text-white"
                                      >
                                        {/* @ts-ignore */}
                                        {nft.role}
                                      </span>
                                      <p className="mt-2 flex items-center text-sm text-gray-500">
                                        <CheckCircleIcon
                                          className="mr-1.5 h-5 w-5 flex-shrink-0 text-indigo-400"
                                          aria-hidden="true"
                                        />
                                        Verified Profile
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  {/* <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedNFTCommends(nft);
                                    }}
                                    className="rounded-md bg-[#333] py-2.5 px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-[#333]/80 transition-all duration-400"
                                  >
                                
                                    {nft.commendCount} Reviews
                                  </button> */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedNFTCommends(nft);
                                    }}
                                    className="rounded-md bg-transparent py-2.5 px-3.5 text-sm font-semibold text-[#777] shadow-sm ring-1 ring-inset ring-[#777] hover:ring-white hover:text-white transition-all duration-200"
                                  >
                                    {/* @ts-ignore */}
                                    {nft.commendCount} Reviews
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedNFT(nft);
                                    }}
                                    className="rounded-md bg-white py-2.5 px-3.5 text-sm font-semibold text-black shadow-sm hover:bg-black hover:text-white ring-1 ring-inset ring-[#555] hover:ring-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#333] transition-all duration-200"
                                  >
                                    Commend
                                  </button>

                                  {/* Give Commend Slide Over */}
                                  <Transition.Root
                                    show={selectedNFT === nft}
                                    as={Fragment}
                                  >
                                    <Dialog
                                      as="div"
                                      //   background blur
                                      className="relative z-50"
                                      onClose={setSlideOverOpen}
                                    >
                                      <div className="fixed inset-0 backdrop-blur-sm" />

                                      <div className="fixed inset-0 overflow-hidden">
                                        <div className="absolute inset-0 overflow-hidden">
                                          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                                            <Transition.Child
                                              as={Fragment}
                                              enter="transform transition ease-in-out duration-500 sm:duration-700"
                                              enterFrom="translate-x-full"
                                              enterTo="translate-x-0"
                                              leave="transform transition ease-in-out duration-500 sm:duration-700"
                                              leaveFrom="translate-x-0"
                                              leaveTo="translate-x-full"
                                            >
                                              <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                                                <div className="flex h-full flex-col divide-y divide-zinc-700 bg-black shadow-xl">
                                                  <div className="h-0 flex-1 overflow-y-auto">
                                                    <div className="bg-[#111] py-6 px-4 sm:px-6">
                                                      <div className="flex items-center justify-between">
                                                        <Dialog.Title className="text-base font-semibold leading-6 text-white">
                                                          Give commend to{" "}
                                                          {/* @ts-ignore */}
                                                          {nft.seller.substring(
                                                            0,
                                                            6
                                                          )}{" "}
                                                          ...
                                                          {/* @ts-ignore */}
                                                          {nft.seller.substring(
                                                            // @ts-ignore
                                                            nft.seller.length -
                                                              4,
                                                            // @ts-ignore
                                                            nft.seller.length
                                                          )}
                                                        </Dialog.Title>
                                                        <div className="ml-3 flex h-7 items-center">
                                                          <button
                                                            type="button"
                                                            className="rounded-md bg-[#333] text-white hover:text-white/80 focus:outline-none focus:ring-2 focus:ring-white"
                                                            onClick={() =>
                                                              setSelectedNFT(
                                                                null
                                                              )
                                                            }
                                                          >
                                                            <span className="sr-only">
                                                              Close panel
                                                            </span>
                                                            <XMarkIcon
                                                              className="h-6 w-6"
                                                              aria-hidden="true"
                                                            />
                                                          </button>
                                                        </div>
                                                      </div>
                                                      <div className="mt-1">
                                                        <p className="text-sm text-[#999]">
                                                          Get started by filling
                                                          in the information
                                                          below to give a
                                                          commend!
                                                        </p>
                                                      </div>
                                                    </div>
                                                    <div className="flex flex-1 flex-col justify-between">
                                                      <div className="divide-y divide-gray-200 px-4 sm:px-6">
                                                        <div className="space-y-6 pt-6 pb-5">
                                                          <div>
                                                            <label
                                                              htmlFor="description"
                                                              className="block text-sm font-medium leading-6 text-white"
                                                            >
                                                              Write your commend
                                                              here
                                                            </label>
                                                            <div className="mt-2">
                                                              <textarea
                                                                rows={4}
                                                                name="comment"
                                                                id="comment"
                                                                className="block w-full rounded-md text-white border-zinc-700 bg-black shadow-sm focus:border-[#333] focus:ring-[#333] sm:text-sm"
                                                                placeholder="This should be a description of how this person has helped you or your team."
                                                                onChange={(
                                                                  event
                                                                ) =>
                                                                  setCommendDescription(
                                                                    event.target
                                                                      .value
                                                                  )
                                                                }
                                                              />
                                                            </div>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="flex flex-shrink-0 justify-end px-4 py-4">
                                                    {commendDescription ? (
                                                      <button
                                                        type="submit"
                                                        className="ml-4 w-full inline-flex justify-center rounded-md bg-white py-2 px-3 text-sm font-semibold text-black shadow-sm hover:bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                                        onClick={() =>
                                                          handleGiveHeat(nft)
                                                        }
                                                      >
                                                        Give Commend
                                                      </button>
                                                    ) : (
                                                      <button
                                                        type="submit"
                                                        className="cursor-not-allowed ml-4 w-full inline-flex justify-center rounded-md bg-white py-2 px-3 text-sm font-semibold text-black shadow-sm hover:bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                                        disabled
                                                      >
                                                        Write a commend first
                                                      </button>
                                                    )}
                                                  </div>
                                                </div>
                                              </Dialog.Panel>
                                            </Transition.Child>
                                          </div>
                                        </div>
                                      </div>
                                    </Dialog>
                                  </Transition.Root>

                                  {/* Reviews SlideOver */}
                                  <Transition.Root
                                    show={selectedNFTCommends === nft}
                                    as={Fragment}
                                  >
                                    <Dialog
                                      as="div"
                                      className="relative z-10 border"
                                      //   @ts-ignore
                                      onClose={setSelectedNFTCommends}
                                    >
                                      <div className="fixed inset-0 backdrop-blur-sm" />

                                      <div className="fixed inset-0 overflow-hidden">
                                        <div className="absolute inset-0 overflow-hidden">
                                          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                                            <Transition.Child
                                              as={Fragment}
                                              enter="transform transition ease-in-out duration-500 sm:duration-700"
                                              enterFrom="translate-x-full"
                                              enterTo="translate-x-0"
                                              leave="transform transition ease-in-out duration-500 sm:duration-700"
                                              leaveFrom="translate-x-0"
                                              leaveTo="translate-x-full"
                                            >
                                              <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl border-l border-[#333]">
                                                <div className="flex h-full flex-col overflow-y-scroll bg-black shadow-xl">
                                                  <div className="px-4 py-6 sm:px-6">
                                                    <div className="flex items-start justify-between">
                                                      <Dialog.Title className="text-base font-semibold leading-6 text-white">
                                                        Profile
                                                      </Dialog.Title>
                                                      <div className="ml-3 flex h-7 items-center">
                                                        <button
                                                          type="button"
                                                          className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500"
                                                          onClick={() =>
                                                            setSelectedNFTCommends(
                                                              null
                                                            )
                                                          }
                                                        >
                                                          <span className="sr-only">
                                                            Close panel
                                                          </span>
                                                          <XMarkIcon
                                                            className="h-6 w-6"
                                                            aria-hidden="true"
                                                          />
                                                        </button>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  {/* Main */}
                                                  <div className="divide-y divide-zinc-700">
                                                    <div className="pb-6 sticky top-0 bg-[#111]">
                                                      <div className="h-24 bg-black sm:h-20 lg:h-28">
                                                        <img
                                                          className="w-full h-full object-cover"
                                                          src={
                                                            //   @ts-ignore
                                                            nft.coverImage
                                                          }
                                                          alt=""
                                                        />
                                                      </div>
                                                      <div className="lg:-mt-15 -mt-12  px-4 sm:-mt-8 sm:flex sm:items-end sm:px-6 ">
                                                        <div>
                                                          <div className="-m-1 flex">
                                                            <div className="inline-flex overflow-hidden rounded-lg border-4 border-[#333]">
                                                              <img
                                                                className="h-24 w-24 flex-shrink-0 sm:h-40 sm:w-40 lg:h-48 lg:w-48"
                                                                src={
                                                                  //   @ts-ignore
                                                                  nft.coverImage
                                                                }
                                                                alt=""
                                                              />
                                                            </div>
                                                          </div>
                                                        </div>
                                                        <div className="mt-6 sm:ml-6 sm:flex-1">
                                                          <div>
                                                            <p className="text-4xl text-white">
                                                              {/* @ts-ignore */}
                                                              {nft.seller.substring(
                                                                0,
                                                                5
                                                              ) +
                                                                "..." +
                                                                // @ts-ignore
                                                                nft.seller.substring(
                                                                  38,
                                                                  42
                                                                )}
                                                              &apos;s Commends
                                                            </p>
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                    {/* @ts-ignore */}
                                                    {/* <ul className="text-white">
                                                      {nft.commendations.map(
                                                        (
                                                          commendation,
                                                          commendIndex
                                                        ) => (
                                                          <li
                                                            key={commendIndex}
                                                          >
                                                            <strong>
                                                              Sender:
                                                            </strong>{" "}
                                                            {
                                                              commendation.sender
                                                            }
                                                            <br />
                                                            <strong>
                                                              Description:
                                                            </strong>{" "}
                                                            {
                                                              commendation.description
                                                            }
                                                          </li>
                                                        )
                                                      )}
                                                    </ul> */}
                                                    <div>
                                                      <ul
                                                        role="list"
                                                        className="divide-y divide-[#111] p-4 space-y-4"
                                                      >
                                                        {/* @ts-ignore */}
                                                        {nft.commendations.map(
                                                          (
                                                            commendation: any,
                                                            commendIndex: any
                                                          ) => (
                                                            <li
                                                              key={commendIndex}
                                                              className="p-4 border border-[#111] rounded-md"
                                                            >
                                                              <div className="flex space-x-3">
                                                                <div className="flex-1 space-y-1">
                                                                  <div className="flex items-center justify-between">
                                                                    <h3 className="text-sm font-medium text-[#999]">
                                                                      {
                                                                        commendation.sender
                                                                      }
                                                                    </h3>
                                                                    <p className="text-sm text-gray-500 p-2">
                                                                      {commendation.timestamp.toLocaleString()}
                                                                    </p>
                                                                  </div>
                                                                  <p className="text-sm text-white ">
                                                                    {
                                                                      commendation.description
                                                                    }
                                                                  </p>
                                                                </div>
                                                              </div>
                                                            </li>
                                                          )
                                                        )}
                                                      </ul>
                                                    </div>
                                                  </div>
                                                </div>
                                              </Dialog.Panel>
                                            </Transition.Child>
                                          </div>
                                        </div>
                                      </div>
                                    </Dialog>
                                  </Transition.Root>
                                </div>
                              </div>
                            </div>
                          </motion.li>
                        ))
                      : [...Array(3)].map((_, index) => (
                          <li className="py-4" key={index}>
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                <div className="bg-[#333] w-10 h-10 animate-pulse rounded-md"></div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="bg-[#333] w-12 h-8 animate-pulse rounded-full"></div>
                                {/* <p className="truncate text-sm text-gray-500">{'@' + person.handle}</p> */}
                              </div>
                              <div>
                                <div className="bg-[#333] w-20 h-8 animate-pulse rounded-full"></div>
                              </div>
                            </div>
                          </li>
                        ))}
                  </ul>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
