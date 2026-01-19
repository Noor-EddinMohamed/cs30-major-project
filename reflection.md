# Reflection

## What advice would you give to yourself if you were to start a project like this again?
I would make sure I really understood the basics of matter.js before starting. I was learning as I went through the project, which is ok, but I wish I understood it more in-depth before starting as to streamline the process.

## Did you complete everything in your needs to have list?
Yes, I did. If I had another week or so I could have further improved the UI and UX which would have been nice, but I'm happy with what I have.

## What was the hardest part of your project?
The hardest part of my project was making my fan apply a realistic force. In matter.js, the applyForce() method is usually applied to the whole world (like gravity, wind, etc) but here I had to constrain it within a certain segment of the screen (between fan edges + above it), as well as making sure other objects can block the fan's airflow. I solved this through learning a bit of basic raytracing from stackoverflow by and detecting if the ball was within the fan's edges and if there were any objects blocking the ray to the ball.

## Were their any problems you could not solve?
There were 2 bugs that I had a hard time replicating which I couldn't 100% fix. The first is that fans sometimes are allowed to overlap with each other during placement. This issue doesn't exist for conveyors so I am not really sure why that's the case. The second is that sometimes the ball seems to spin a bit causing it to bounce backwards sometimes with no apparent reason for the user. This isn't really a bug per say; this could have been fixed by just adding a gleam to the ball and it probably would have been clearer to the user why that odd bounce is happening.