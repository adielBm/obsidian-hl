## Subresource Integrity

If you are loading Highlight.js via CDN you may wish to use [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity) to guarantee that you are using a legimitate build of the library.

To do this you simply need to add the `integrity` attribute for each JavaScript file you download via CDN. These digests are used by the browser to confirm the files downloaded have not been modified.

```html
<script
  src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/highlight.min.js"
  integrity="sha384-pGqTJHE/m20W4oDrfxTVzOutpMhjK3uP/0lReY0Jq/KInpuJSXUnk4WAYbciCLqT"></script>
<!-- including any other grammars you might need to load -->
<script
  src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/languages/go.min.js"
  integrity="sha384-Mtb4EH3R9NMDME1sPQALOYR8KGqwrXAtmc6XGxDd0XaXB23irPKsuET0JjZt5utI"></script>
```

The full list of digests for every file can be found below.

### Digests

```
sha384-gMzC3hkIwZjphoJMIhit7PxZx61AJssvwGFe8vEDLw11n5Oglv7+CsYT0Bk4U3NR /es/languages/mipsasm.js
sha384-hzQcVB7Qny4YQPUuHQtZ+wHvcpHWNYimKmHONk5g77Fca1MwwkNixH7uPmFnZSIB /es/languages/mipsasm.min.js
sha384-Ts2JYqrveTDUYgCpQAOM+PD73GbTlU1aBGZj5JaY6pF+XUqq2MOZ6w532HEl3pwt /languages/mipsasm.js
sha384-Hc5qAKAeMWj7W95V6BNPzRqhhA2leur3hyGlhd4ncVW5kO+LReHa1M+XfT9qrRC5 /languages/mipsasm.min.js
sha384-H+LGoIrVbHYZUBXEKCp2ZCofEtEUNZzyKGvRlzBBeUTf3X/xHLWB4NSc/tAwtKht /highlight.js
sha384-gkmDQDeq5iF0ED/AmgtsPlZVnf1nC7iGd+43N8WANfyRlOV+lzAfQdrN3nEfZrqN /highlight.min.js
```

