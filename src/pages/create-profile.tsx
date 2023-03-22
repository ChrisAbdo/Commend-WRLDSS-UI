import Web3 from "web3";
import Commend from "@/backend/build/contracts/Commend.json";
import NFT from "backend/build/contracts/NFT.json";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

// import { useToast } from "@/hooks/ui/use-toast";

import { motion, AnimatePresence } from "framer-motion";

import { useEffect, useState, Fragment } from "react";

const products = [
  {
    id: 1,
    title: "Basic Tee",
    href: "#",
    price: "$32.00",
    color: "Black",
    size: "Large",
    imageSrc:
      "https://tailwindui.com/img/ecommerce-images/checkout-page-02-product-01.jpg",
    imageAlt: "Front of men's Basic Tee in black.",
  },
  // More products...
];

const ipfsClient = require("ipfs-http-client");
const projectId = "2FdliMGfWHQCzVYTtFlGQsknZvb";
const projectSecret = "2274a79139ff6fdb2f016d12f713dca1";
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
const client = ipfsClient.create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

const TextAnimation = ({ address = "" }) => {
  const letterVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: (custom: any) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: custom * 0.1,
      },
    }),
  };

  const renderLetters = () => {
    return address.split("").map((letter, index) => (
      <motion.span
        key={index}
        custom={index}
        variants={letterVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        {letter}
      </motion.span>
    ));
  };

  return <>{renderLetters()}</>;
};
const animationVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: (i: any) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } }),
};

const people = [
  { id: 1, name: "Wade Cooper" },
  { id: 2, name: "Arlene Mccoy" },
  { id: 3, name: "Devon Webb" },
  { id: 4, name: "Tom Cook" },
  { id: 5, name: "Tanya Fox" },
  { id: 6, name: "Hellen Schmidt" },
  { id: 7, name: "Caroline Schultz" },
  { id: 8, name: "Mason Heaney" },
  { id: 9, name: "Claudie Smitham" },
  { id: 10, name: "Emil Schaefer" },
];

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

export default function CreateProfile() {
  //   const { toast } = useToast();

  const [formInput, updateFormInput] = useState({
    title: "",
    coverImage: "",
    role: "",
  });

  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);

  const [coverImage, setCoverImage] = useState(null);

  const [role, setRole] = useState("");

  const [songTitle, setSongTitle] = useState("");

  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [selected, setSelected] = useState(people[3]);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleDrop(e: any) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    setFile(file);
  }

  function handleDragOver(e: any) {
    e.preventDefault();
  }

  function handleDrop2(e: any) {
    e.preventDefault();
  }

  function handleDragOver2(e: any) {
    e.preventDefault();
  }

  function handleFileInputChange(e: any) {
    // @ts-ignore
    setFile(URL.createObjectURL(e.target.files[0]));
  }

  async function onChange(e: any) {
    // upload image to IPFS

    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog: any) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.io/ipfs/${added.path}`;
      console.log(url);

      // @ts-ignore
      setFileUrl(url);
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function createCoverImage(e: any) {
    // upload image to IPFS
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog: any) => console.log(`received: ${prog}`),
      });
      const url = `https://ipfs.io/ipfs/${added.path}`;
      console.log(url);
      // @ts-ignore
      setCoverImage(url);
      updateFormInput({
        ...formInput,
        coverImage: url,
      }); // update form input with cover image URL
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }

  async function uploadToIPFS() {
    const { title, coverImage, role } = formInput;
    if (!title || !coverImage || !role || !fileUrl) {
      return;
    } else {
      // first, upload metadata to IPFS
      const data = JSON.stringify({
        title,
        coverImage,
        image: fileUrl,
        role,
      });
      try {
        const added = await client.add(data);
        const url = `https://ipfs.io/ipfs/${added.path}`;
        // after metadata is uploaded to IPFS, return the URL to use it in the transaction

        return url;
      } catch (error) {
        console.log("Error uploading file: ", error);
      }
    }
  }

  async function listNFTForSale() {
    try {
      setLoading(true);
      //   toast({
      //     title: "Please confirm both transactions in your wallet",
      //     description: "Thanks for uploading your song!",
      //   });
      // @ts-ignore
      const web3 = new Web3(window.ethereum);
      const url = await uploadToIPFS();

      const networkId = await web3.eth.net.getId();

      // Mint the NFT
      // @ts-ignore
      const NFTContractAddress = NFT.networks[networkId].address;
      // @ts-ignore
      const NFTContract = new web3.eth.Contract(NFT.abi, NFTContractAddress);
      const accounts = await web3.eth.getAccounts();

      const radioContract = new web3.eth.Contract(
        // @ts-ignore
        Radio.abi,
        // @ts-ignore
        Radio.networks[networkId].address
      );

      NFTContract.methods
        .mint(url)
        .send({ from: accounts[0] })
        .on("receipt", function (receipt: any) {
          console.log("minted");
          // List the NFT
          const tokenId = receipt.events.NFTMinted.returnValues[0];
          radioContract.methods
            .listNft(NFTContractAddress, tokenId)
            .send({ from: accounts[0] })
            .on("receipt", function () {
              console.log("listed");
              setLoading(false);
              //   toast({
              //     title: "Your song has been uploaded!",
              //     description: "You can find it on the listen page",
              //   });
            });
        });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <div className="bg-black h-screen">
        <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
            <div>
              <AnimatePresence>
                <div>
                  <motion.h2
                    className="text-lg font-medium text-white"
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    variants={animationVariants}
                  >
                    Create a Commend Profile
                  </motion.h2>

                  <motion.div
                    className="mt-4"
                    custom={2}
                    initial="hidden"
                    animate="visible"
                    variants={animationVariants}
                  >
                    <label
                      htmlFor="email-address"
                      className="block text-sm font-medium text-white"
                    >
                      Choose cover image
                    </label>
                    <div className="mt-1">
                      <div className="rounded-md border border-[#333]">
                        <div className="mb-4 p-4">
                          <input
                            id="fileInput"
                            type="file"
                            accept="image/*"
                            // onChange={handleFileInputChange}
                            onChange={(e) => {
                              createCoverImage(e);
                              handleFileInputChange(e);
                            }}
                            className="appearance-none border border-[#333] rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                          />
                        </div>
                        <div
                          className=" p-4 text-center"
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                        >
                          <p className="text-white">
                            Drag and drop a file here or choose a file.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="mt-4"
                    custom={3}
                    initial="hidden"
                    animate="visible"
                    variants={animationVariants}
                  >
                    <label htmlFor="email">Title</label>
                    <div>
                      <label
                        htmlFor="location"
                        className="block text-sm font-medium leading-6 text-white"
                      >
                        Location
                      </label>
                      <select
                        id="location"
                        name="location"
                        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-white bg-black ring-1 ring-inset ring-[#111] focus:ring-2 focus:ring-[#333] sm:text-sm sm:leading-6"
                        defaultValue="Canada"
                        onChange={(e) => {
                          updateFormInput({
                            ...formInput,
                            role: e.target.value,
                          });
                          setRole(e.target.value);
                        }}
                        onSelect={(e) => {
                          updateFormInput({
                            ...formInput,
                            // @ts-ignore
                            role: e.target.value,
                          });
                        }}
                      >
                        <option value="US">United States</option>
                        <option>Canada</option>
                        <option>Mexico</option>
                      </select>
                    </div>
                  </motion.div>
                </div>
              </AnimatePresence>
            </div>

            {/* Order summary */}
            <div className="mt-10 lg:mt-0">
              <h2 className="text-lg font-medium text-white">Upload Preview</h2>

              {/* <div className="mt-4 rounded-lg border border-gray-200 dark:border-[#333] bg-white dark:bg-black shadow-sm"> */}
              <motion.div
                className="mt-4 rounded-lg border border-[#333] bg-black shadow-sm"
                custom={5}
                initial="hidden"
                animate="visible"
                variants={animationVariants}
              >
                <h3 className="sr-only">Items in your cart</h3>
                <ul role="list" className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <li key={product.id} className="flex py-6 px-4 sm:px-6">
                      <div className="flex-shrink-0">
                        {file ? (
                          <img
                            // @ts-ignore
                            src={file}
                            alt={product.imageAlt}
                            className="w-20 rounded-md"
                          />
                        ) : (
                          <div className="bg-[#333] w-20 h-20 animate-pulse rounded-md" />
                        )}
                      </div>

                      <div className="ml-6 flex flex-1 flex-col">
                        <div className="flex">
                          <div className="min-w-0 flex-1">
                            <AnimatePresence>
                              <div className="mt-1 bg-[#333] w-3/3 h-6 animate-pulse rounded-md" />
                            </AnimatePresence>
                            {/* <p className="mt-1 text-sm text-gray-500">GENRE</p> */}
                            <h4>
                              {role ? (
                                <span className="text-lg text-white">
                                  {role}
                                </span>
                              ) : (
                                <div className="mt-1 bg-[#333] w-1/3 h-6 animate-pulse rounded-md" />
                              )}
                            </h4>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-[#333] py-6 px-4 sm:px-6">
                  <button className="w-full  justify-center bg-indigo-500 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex items-center text-base font-medium text-white hover:bg-[#ff4d4d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff4d4d]">
                    Create Profile
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
