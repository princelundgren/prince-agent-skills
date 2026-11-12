# Stop after repeated failures — don't loop on guessed variations

After 2-3 consecutive failures on essentially the same action, stop guessing and switch strategy:
reuse the literal output of a tool that already answered reliably, or surface the failure and ask.

- **Reuse literal tool output.** A path, name or ID that `find`, `glob` or `ls` already returned
  is carried over exactly, never retyped from memory, however simple it looks.
- **Two or three failed variations is the signal to stop, not to try harder.** Go back to a tool
  that answers the question directly (`pwd`, `ls`, `glob`, `find`) instead of guessing freehand.
- **A different guess each time is still a loop**, even when no command repeats exactly; near
  misses are not progress.
- **Still stuck after one switch of strategy: stop and say so.**
