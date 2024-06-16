import React from "react";
import InvitesMenu from "./InvitesMenu";
import { acceptRoomInvite, rejectRoomInvite } from "@/api/room";
import Image from "next/image";

const InvitesWrapper = ({
  invitesMenuRef,
  setInvitesMenuOpen,
  invitesMenuOpen,
  invites,
}) => {
  return (
    <div className="relative w-48 text-primary text-xs my-6" ref={invitesMenuRef}>
      <span className="font-bold absolute -top-4 left-0">ROOM INVITES</span>

      <button
        className="flex items-center bg-primary text-background p-1 justify-between w-full"
        onClick={() => setInvitesMenuOpen(!invitesMenuOpen)}
      >
        <div className="flex items-center">
          {invites.length > 0 && <span className="w-2 h-2 bg-secondary rounded-full"></span>}
          <p>Invites</p>
        </div>
        <Image src="/arrow.svg" alt="arrow" width={10} height={10} />
      </button>
      {invitesMenuOpen && (
        <InvitesMenu
          invites={invites}
          acceptRoomInvite={acceptRoomInvite}
          rejectRoomInvite={rejectRoomInvite}
        />
      )}
    </div>
  );
};

export default InvitesWrapper;
