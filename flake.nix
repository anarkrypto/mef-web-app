{
  description = "Next.js development environment with Podman";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    # Systems support
    systems.url = "github:nix-systems/default";
  };

  outputs = { self, nixpkgs, systems, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Core dependencies
            nodejs_20
            nodePackages.typescript
            nodePackages.tsx
            podman
            podman-compose
            direnv
            git
          ];

          shellHook = ''
            echo "🚀 Next.js development environment activated"
            
            # Ensure podman socket is running
            if ! podman system service --time=0 >/dev/null 2>&1; then
              echo "Starting podman socket..."
              podman system service --time=0 >/dev/null 2>&1 &
            fi

            # Environment variables for podman
            export DOCKER_HOST="unix://$XDG_RUNTIME_DIR/podman/podman.sock"
            export DOCKER_CONTEXT="default"

            # Load .env file if it exists
            if [ -f .env ]; then
              set -a
              source .env
              set +a
            fi
          '';

          # Add environment variables
          env = {
            NODE_ENV = "production";
          };
        };
      });
}