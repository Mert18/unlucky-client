'use client'
import React from "react";
import RoomsMenu from "./RoomsMenu";
import Image from "next/image";
import { useTranslation } from "react-i18next";

const RoomsSelector = ({
  roomsMenuRef,
  setRoomsMenuOpen,
  roomsMenuOpen,
  rooms,
  roomId,
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="relative w-32 text-primary text-xs my-6" ref={roomsMenuRef}>
      <span className="font-bold absolute -top-4 left-0">{t("roomSelect").toUpperCase()}</span>
      <button
        onClick={() => setRoomsMenuOpen(!roomsMenuOpen)}
        className="bg-primary text-background p-1 flex justify-between w-full"
      >
        <p>{rooms.find((room) => room.id === roomId)?.name || t("roomSelect")}</p>
        <Image src="/arrow.svg" alt="arrow" width={10} height={10} />
      </button>
      {roomsMenuOpen && (
        <RoomsMenu
          rooms={rooms}
          setRoomsMenuOpen={setRoomsMenuOpen}
          roomId={roomId}
        />
      )}
    </div>
  );
};

export default RoomsSelector;
