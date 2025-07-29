import Link from "next/link";
import { styled } from "@mui/material";
import Image from "next/image";

const LinkStyled = styled(Link)(() => ({
  height: "70px",
  width: "180px",
  overflow: "hidden",
  display: "block",
}));

const Logo = () => {
  return (
    <LinkStyled href="/">
      <Image src={'/img/logo-elemes.png'} alt="logo" height={130} width={240} style={{ marginTop: "20px" }} priority />
    </LinkStyled>
  );
};

export default Logo;
