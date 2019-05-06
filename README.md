# streamdeckVLCconnect
connects with VLC's web server to provide basic remote control.

For use download the com.adm.cdwn.streamDeckPlugin in the Release folder

V0.5.1 - ADDED: a brief explanation in the PI as to how the plugin interacts, and added a link to VLC's wiki to help users set it up.
	Bug fixes: password field was not set correctly, and was displaing the password in the chrome debug tool.
V0.5 - now saves and uses the password saved in the property inspector. Cleaned up the code a little, comments to explain more stuff.
V0.4 - by default a button does nothing, so show a warning icon, and update the PI so that it's a little more self explanitory.
V0.3 - Updated a couple of icons, template for current volume as a title for the volume buttons. Moved to its own category.
V0.2 - now each control has its own icon, if any graphics designers are better than me feel free to fork

Requirements:
Streamdeck + software
VLC media player
VLC needs to be configured to use the http controller

On local machines connect the the following to test VLC's default setup: http://127.0.0.1:8080/

All Code is released free to use, modify and most importantly LEARN!