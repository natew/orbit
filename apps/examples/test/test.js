export default [{"title":[" Editor doesn't load properly in Safari"],"text":[" This is because Safari doesn’t support new Proxy, which is used in various ways. We have a couple options here: shim using a JS library, or rewrite some of the bits to not use the proxy. Since the proxy code isn’t actually necessary, I think we might want to go in that direction. What do you think @John?"],"queries":["","safari proxy","safari doesn't new proxy","editor doesnt load","editor loading bug"]},{"title":[" Multiplayer user list on mobile"],"text":[" There’s no way to expand the list of who is currently in a workspace on mobile. We should add a modal that allows the user to see more items."],"queries":["","user list mobile multiplayer","user list mobile"]},{"title":[" Support Drag and Drop API for images outside of browser"],"text":[" We need to look into how to support the drag and drop api as far back as it was available in browsers. We also need to figure out how to upload the image to our server, and which image types we want to support."],"queries":["","drag and drop","drop images","images browser"]},{"title":[" Basic image editing features"],"text":[" How much should we support image editing? Having no image editing capabilities is clearly wrong, because most mockups include at least a few images. At the same time, we don’t want to enter the territory of photoshop."],"queries":["","edit images"]},{"title":[" UI for download project as image"],"text":[" We’ve heard feedback that it’s confusing how you can download the current workspace as an image. It’s currently available in the file menu under a sub-option, but perhaps we should make it a higher level button above the editor."],"queries":["","export image","user interface for downloading project"]},{"title":[" Performance for multiple images stack on top of each other"],"text":[" If you have two images on top of each other in the editor right now, it slows the CPU by quite a lot. This might have something to do with the shaders we’re using in WebGL. We can easily fix this by using multiple canvases, but there might be a more elegant solution here."],"queries":["","multiples images slows","multiple images performance"]},{"title":[" Improve editor load performance"],"text":[" The editor is currently taking 760ms to load in the latest Chrome. The bulk of this loading time is simply downloading the JS bundle. In fact, by using better compression algorithms, we should be able to get it under 300ms. We should try this as a first step, and then moving forward, see if we can upgrade React to get perf improvements there."],"queries":["","editor performance","better editor performance","faster editor"]},{"title":[" Context menu doesn’t show up sometimes"],"text":[" We’ve been getting reports that context menus aren’t showing up in certain situations. It seems to be mainly when the user’s UI thread is blocked, or when there’s a tool selected that isn’t the normal cursor. What should we do for right-click when different tools are selected? Potentially we could have different options for that tool, and autogenerate a context menu based on the settings there."],"queries":["","context menu not showing","context menu hidden","context hidden"]},{"title":[" Zooming on editor should be on GPU"],"text":[" Currently the editor is loaded on the CPU, which makes sense. However, we should be able to put zoom on the GPU using linear transforms. Evan has done this already in a limited test case, but we haven’t shipped it into the product yet. We should be able to do this in Figma 2.1.0, and we may want to consider adding it to the list of deliverables."],"queries":["","editor zoom","zoom speed"]},{"title":[" Editor should expand when window resized"],"text":[" Right now the editor expands when the window moves, but it sometimes has issues when the browser’s window is resized. Seems like a reversion in the last 2 pushes."],"queries":["","editor expand","editor resize","editor get bigger","window doesn't get bigger"]},{"title":[" Mobile viewer loading performance"],"text":[" It’s really important that loading speed is fast on mobile, because downloading heavy files over 4g can take a long time. Perhaps the best way is to store a compression version of the file ahead of time, so that it can be downloaded more quickly."],"queries":["","mobile viewer slow","mobile loading"]},{"title":[" Allow reactions in mobile"],"text":[" reactions and GIFs!"],"queries":["","mobile reactions","reactions"]},{"title":[" Multiplayer Presentations"],"text":[" This is a big one. It would be nice if people could all access the same workspace at the same time so they can access it during a presentation. No more needing to ask for presentation links after. We could potentially even offer social features here, such as voting on questions during the presentation."],"queries":["","presentations","presentation","multiplayer presentations","multiple person presentations"]},{"title":[" Multiplayer user list, new visual indicator"],"text":[" Currently we have a standard list for seeing who’s in the same workplace. However, this might be a fun area to innovate creatively on. Maybe we could have a neat graphic that animates based on the last person that entered. I don’t have any particular beliefs at the moment, but rather a general intuition that there’s something here!"],"queries":["","user list","multiplayer user list","UI user list"]},{"messages":["","nick: do we know what we're using for oauth yet? We need to be able to download the Slack chatrooms for the social features.","nate: I think we're using a library for this somewhere else? @tim","tim: We tried using Passport but we had some issues.","nick: is that called on the frontend or backend?","tim: backend, in node.","nick: cool - will look into it more!"],"queries":["","oauth","oauth library","passport","node oauth"]},{"messages":["","john: alright guys, which snacks do we need","jessica: cheez-its, is that even a question","tim: beef jerkey that I can chew on for 12h","jessica: is there any other kind of beef jerkey?","tim: no need to be a jerkey about it ;)","john: ordered!"],"queries":["","office snacks"]},{"messages":["","john: we're having a carpender come in on Thursday to fix the ceiling","tim: sound breaks me. Should I work from a cafe during that time","john: yea, cappuccino's on me","sara: what time?","john: 3:30pm - ~5:30pm",""],"queries":["","carpender","worker visiting"]},{"messages":["","dylan: we're out of chairs, growing too fast!","john: hmm we could grow slower","dylan: yeah that's probably the easiest plan","tim: @john was talking about ordering chairs","john: 15 chairs are on their way"],"queries":["","chairs"]},{"messages":["","dylan: ordering food, who's down","sara: pizza","john: chinese","tim: both?","dylan: down for pizza","john: I'll relent to my new leaders","dylan: pizza in 20"],"queries":["","order food"]},{"messages":["","evan: when should we discuss the perf issue for zoom?","dylan: 3pm? who should be there","evan: you me and sara probably","dylan: @sara work for you?","sara: yup!"],"queries":["","performance issues for zoom",""]},{"messages":["","evan: weekly meeting in 20m?","dylan: push back 15m?","evan: sure"],"queries":["","pushing back weekly meeting"]},{"messages":["","dylan: have you talked to Fuel recently?","evan: nope, why?","dylan: I'm meeting him at 7pm and I just wanted to know if there's any updates","evan: what does he think of multiplayer?","dylan: loves it!"],"queries":["","Fuel","meeting Fuel"]},{"messages":["","john: any updates on the database question?","evan: I think we're going to use mongo, but really it doesn't matter that much","evan: our needs are pretty simple, so just about any db should work","dylan: I heard rethink was good?","evan: they went out of business?","dylan: aww, okay mongo it is I guess"],"queries":["","choosing a database","rethink database"]},{"messages":["","evan: we should probably talk about how we're going to approach panning in webgl","john: yeah I was talking to Tim about it yesterday and he wasn't really sure","evan: how about we grab a meeting room in 20?","john: yeah @tim you down?","tim: yeah sounds good"],"queries":["","webgl","webgl panning with Tim"]},{"messages":["","dylan: my friend Jim wants to come over the office and learn a bit about our startup. when's the best time for him to do that?","evan: how technical is he?","dylan: barely","evan: okay well it's probably not super important that I'm there then, and I'd rather not be","dylan: @john you want to hang out with us","dylan: over dinner, so probably like 7pm or so","john: booked for that night","dylan: okay it'll just be me and Jim then!"],"queries":["","visiting our office","jim visits the office"]},{"messages":["","tim: our backup infrastructure for the database is kind of terrifying.","dylan: yeah, we need to upgrade it. It's daily now right?","tim: ..monthly, hence the terrifying comment","dylan: oh man","dylan: okay yeah let's make it daily, and doesn't Amazon have a good service for this?","tim: https://aws.amazon.com/glacier/","tim: I haven't used it but it looks reasonable","dylan: cool lets do it"],"queries":["","backups","backup infrastructure","glacier","amazon backups"]},{"messages":["","dylan: when are we planning on shipping 0.2.0","jessica: Tuesday at some point","jessica: let me look up when","jessica: 11:30am","dylan: okay are we ready with the announcement blog post?","john: nope, but it'll be ready by Monday","dylan: who's reviewing","john: can you?","dylan: sure","john: okay will send it on Monday"],"queries":["","blog post announcing","0.2.0"]},{"messages":["","evan: are we launching 0.3 to all users or to a subset first","john: we're thinking of subsetting it to just educational users first","evan: which features?","john: they're tagged on github under #0.3beta","evan: okay cool"],"queries":["","0.3"]},{"messages":["","evan: how are we handling compression during production?","evan: and how much storage has it saved","tom: it looks like we can compress it by about 70% using gzip in prod","evan: oh it's already shipped?","tom: yep!"],"queries":["","compressing files"]},{"messages":["","evan: morning guys!","jessica: morning","john: morning!!","evan: it's so hot in here","john: let me open window, it's ridiculous","jessica: got my iced tea, keepin it cool","dylan: I want to go back to the east coast","evan: lol"],"queries":["","warm office"]},{"messages":["","evan: anyone allergic to dogs?","dylan: why..?","evan: my friend is bringing his dog over!","john: does it cuddle","evan: only with me","john: I will win its trust","jessica: no allergies here!"],"queries":["","allergies","bringing dogs"]},{"messages":["","jessica: my friend brought pretzels from germany!","dylan: aren't they austrian?","jessica: somewhere in europe","dylan: whatever, they're pretzels, I'm down"],"queries":["","snacks","pretzels","austria"]},{"messages":["","john: had a meeting earlier today to discuss our plans to get a new office. We still don't know if we actually need to get a new office, but it's worth at least looking so we know roughly what the market looks like, particularly at the size we're interested in"],"queries":["","getting a new office"]},{"messages":["","dylan: today we talked about performance for canvas loading time and whether we should just ditch it and move to WebGL. We think that we should give canvas another shot, because it has such better support that it might just be worth the extra effort it takes to rangle in.","dylan: I think the best situation is to try it for another three weeks, and move on if it doesn't wrok","evan: also we figured out that we need a specific new library that I'm going to work on this week"],"queries":["","canvas performance time","new webgl library"]},{"messages":["","tim: what's the password for Mixpanel?","dylan: same as for most of our logins I think","tim: isn't working for me.. any idea why?","dylan: talk to jessica?","tim: I did","dylan: how about Robert?","tim: okay will do"],"queries":["","Mixpanel","mixpanel login"]},{"messages":["","dylan: we're looking at adding an option for incognito. Potentially having an always-on list for who is currently viewing your workspace is a bit much.","nick: yeah I heard that from a few users too","dylan: let's add for next month?","nick: it's pretty busy, but there is a similar feature in the month after","dylan: let's reconsider in a few weeks"],"queries":["","incognito","viewing workspace"]},{"messages":["","jessica: we're getting a lot of bugs over twitter. how do we move them into tickets?","dylan: I think zendesk has a good thing for this.","jessica: oh sweet yea, this looks perfect","dylan: @ben can hook it up and get it running","jessica: yes please, this would be so helpful compared to me just checking it once an hour to see what's new"],"queries":["","twitter tickets","twitter zendesk"]},{"messages":["","jessica: btw I upgraded our fb page to one that could do advertisements","dylan: cool I think we get some credits for adwords through fuel though","jessica: okay yeah we can use either platform","tim: I've heard better things about fb but I'm not sure","dylan: I think for design, fb might be better. We get more visual space too","john: I can design a ridiculously pretty ad","jessica: yes!"],"queries":["","fb advertisements","adwords"]},{"messages":["","jessica: jesus, Gruber just wrote a blog post about us","dylan: woo - I saw","jessica: he really liked it!","dylan: let's RT it","jessica: already did ;)"],"queries":["","wrote blog"]},{"messages":["","john: stuck outside, what do we do","dylan: oh god, let me call the building security guard to let you in","john: thx","dylan: did he get you?","john: yea, all warm now :)"],"queries":["","stuck outside building"]}]