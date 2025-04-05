{ pkgs }: {
  deps = [
    pkgs.psmisc
    pkgs.rustc
    pkgs.cargo
    pkgs.nodejs
    pkgs.python3
    pkgs.simple-http-server
  ];
}
