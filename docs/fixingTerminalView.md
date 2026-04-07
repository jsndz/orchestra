First major block of project:

Terminal Rendering not working.

the Main Thread is sending the data
But couldn't see any data in terminal. 

After vibe coding a lot, came to conclusion that i need to understand.
UseRef, UseEffects, Zustand Store.

Lets Start with useRef,(https://react.dev/learn/referencing-values-with-refs)
In react useRef is a something that doesn't change on render.
Use when you want something to stick through the re-render.
Here when ever i get the data from main thread
i should store it and should not update it with re-render
so useRef, can be used  when you have to “step outside React” like calling browser API.
Or useRef also used when you have to keep something after the useEffect is done like
const termRef = useRef<XTerm | null>(null);
here you use this such that even after useRef is done you can use the same terminal

DOnt useRef when you want to show the data between re-renders
You instruct React to put a DOM node into myRef.current by passing <div ref={myRef}>.

