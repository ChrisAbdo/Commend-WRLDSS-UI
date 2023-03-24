import Web3 from "web3";
import Commend from "@/backend/build/contracts/Commend.json";
import NFT from "backend/build/contracts/NFT.json";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

// import { useToast } from "@/hooks/ui/use-toast";

import { motion, AnimatePresence } from "framer-motion";

import { useEffect, useState, Fragment } from "react";

declare var window: any;

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

export default function CreateProfile() {
  //   const { toast } = useToast();

  const [formInput, updateFormInput] = useState({
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

  const web3 = new Web3(Web3.givenProvider);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState("");

  useEffect(() => {
    const loadConnectedAccount = async () => {
      const accounts = await web3.eth.getAccounts();
      if (accounts.length > 0) {
        setConnectedAccount(accounts[0]);
      }
    };

    // event listener for MetaMask account change

    window.ethereum.on("accountsChanged", function (accounts: string[]) {
      setConnectedAccount(accounts[0]);
    });

    // event listener for MetaMask disconnect
    window.ethereum.on(
      "disconnect",
      function (error: { code: number; message: string }) {
        // @ts-ignore
        setConnectedAccount(null);
      }
    );

    loadConnectedAccount();
  }, []);

  const connectWallet = async () => {
    try {
      const accounts = await web3.eth.requestAccounts();
      setConnectedAccount(accounts[0]);
    } catch (err) {
      console.error(err);
    }
  };

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
    const { coverImage, role } = formInput;
    if (!coverImage || !role || !fileUrl) {
      return;
    } else {
      // first, upload metadata to IPFS
      const data = JSON.stringify({
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

      const commendContract = new web3.eth.Contract(
        // @ts-ignore
        Commend.abi,
        // @ts-ignore
        Commend.networks[networkId].address
      );

      NFTContract.methods
        .mint(url)
        .send({ from: accounts[0] })
        .on("receipt", function (receipt: any) {
          console.log("minted");
          // List the NFT
          const tokenId = receipt.events.NFTMinted.returnValues[0];
          commendContract.methods
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
                              onChange(e);
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
                        htmlFor="role"
                        className="block text-sm font-medium leading-6 text-white"
                      >
                        Role
                      </label>
                      <select
                        id="role"
                        name="role"
                        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-white bg-black ring-1 ring-inset ring-[#111] focus:ring-2 focus:ring-[#333] sm:text-sm sm:leading-6"
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
                        <option value="" hidden disabled selected>
                          Select a role
                        </option>
                        <option>Software Engineer</option>
                        <option>Product Manager</option>
                        <option>Designer</option>
                        <option>Marketing</option>
                        <option>Sales</option>
                        <option>Community Manager</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </motion.div>

                  <motion.div
                    className="mt-4"
                    custom={4}
                    initial="hidden"
                    animate="visible"
                    variants={animationVariants}
                  >
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium leading-6 text-white"
                      >
                        Confirm wallet address
                      </label>
                      <div className="mt-2">
                        {connectedAccount ? (
                          <input
                            type="email"
                            name="email"
                            id="email"
                            className="cursor-not-allowed block w-full rounded-md border-0 py-1.5 bg-black text-white shadow-sm ring-1 ring-inset ring-[#111] placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder={connectedAccount}
                            disabled
                            aria-describedby="email-description"
                          />
                        ) : (
                          <button
                            className="bg-[#333] text-white rounded-md px-4 py-2 w-full"
                            onClick={connectWallet}
                          >
                            Connect Wallet to Continue
                          </button>
                        )}
                      </div>
                      <p
                        className="mt-2 text-sm text-white font-bold"
                        id="email-description"
                      >
                        Commend does not ask you to sign anything. You should
                        only connect an account to Polygon Mainnet and make
                        simple contract interactions.
                      </p>
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
                            <h4>
                              {connectedAccount ? (
                                <span className="text-lg text-white">
                                  {connectedAccount}
                                </span>
                              ) : (
                                <div className="bg-[#333] w-full h-9 animate-pulse rounded-md" />
                              )}
                            </h4>

                            <h4>
                              {role ? (
                                <span className="text-lg text-white">
                                  {role}
                                </span>
                              ) : (
                                <div className="mt-1 bg-[#333] w-1/3 h-9 animate-pulse rounded-md" />
                              )}
                            </h4>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-[#333] py-6 px-4 sm:px-6">
                  {connectedAccount && (
                    <button
                      onClick={listNFTForSale}
                      className="w-full  justify-center bg-white border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex items-center text-base font-medium text-black hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff4d4d]"
                    >
                      Create Profile
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
