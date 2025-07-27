# Personal Stack Overflow

## Q CLI Command Error - 2025-07-27

**Problem**: Got an error when trying to use `--no-interactive` and `--trust-all-tools` commands with Q CLI

**Solution**: These flags can only be used with the `q chat` command, not just `q`

**Command that works**: `q chat --no-interactive --trust-all-tools`
**Command that doesn't work**: `q --no-interactive --trust-all-tools`
