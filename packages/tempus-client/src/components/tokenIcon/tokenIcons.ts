import { Ticker } from '../../interfaces';

export const tokenIcons: { [key in Ticker]: string } = {
  aave: `
    <g fill="none">
      <circle fill="#2EBAC6" cx="16" cy="16" r="16"/>
      <path d="M22.934 21.574l-5.35-13.532C17.28 7.342 16.834 7 16.243 7h-.473c-.592 0-1.039.343-1.341 1.042l-2.327 5.896h-1.761c-.528.002-.956.448-.96 1v.014c.004.553.432.999.96 1.001h.946l-2.221 5.621a1.235 1.235 0 00-.066.384c0 .315.092.562.263.754.17.192.407.288.71.288a.933.933 0 00.552-.192c.17-.123.289-.302.38-.507l2.446-6.348h1.696c.527-.002.955-.449.96-1.001v-.027c-.005-.553-.433-1-.96-1.001h-.907l1.866-4.867L21.093 22.3c.092.205.21.384.381.507.161.122.354.19.553.192.302 0 .539-.096.71-.288.17-.192.262-.439.262-.754a.944.944 0 00-.065-.384z" fill="#FFF"/>
    </g>`,
  comp: `
    <g fill="none" fill-rule="evenodd">
      <circle fill="#00D395" fill-rule="nonzero" cx="16" cy="16" r="16"/>
      <path d="M8.57 21.587a1.67 1.67 0 01-.82-1.429v-3.253c0-.387.322-.7.716-.698.126 0 .25.033.36.095l7.503 4.281c.439.25.71.71.71 1.207v3.37a.845.845 0 01-.855.84.883.883 0 01-.45-.123l-7.164-4.29zm11.184-6.176c.44.25.708.711.71 1.207v6.84c0 .202-.11.389-.291.487l-1.642.904a.29.29 0 01-.067.027v-3.798c0-.492-.263-.948-.696-1.2L11.18 16.02v-4.287c0-.387.322-.7.717-.698a.73.73 0 01.359.095l7.5 4.281zm3.285-5.052c.44.25.711.71.711 1.209v9.99a.564.564 0 01-.301.492l-1.557.823v-6.956c0-.491-.264-.946-.693-1.199l-6.736-3.953V6.7c0-.124.035-.245.096-.352a.725.725 0 01.977-.253l7.503 4.265z" fill="#FFF"/>
    </g>`,
  dai: `
    <g fill="none" fill-rule="evenodd">
      <circle fill="#F4B731" fill-rule="nonzero" cx="16" cy="16" r="16"/>
      <path d="M9.277 8h6.552c3.985 0 7.006 2.116 8.13 5.194H26v1.861h-1.611c.031.294.047.594.047.898v.046c0 .342-.02.68-.06 1.01H26v1.86h-2.08C22.767 21.905 19.77 24 15.83 24H9.277v-5.131H7v-1.86h2.277v-1.954H7v-1.86h2.277V8zm1.831 10.869v3.462h4.72c2.914 0 5.078-1.387 6.085-3.462H11.108zm11.366-1.86H11.108v-1.954h11.37c.041.307.063.622.063.944v.045c0 .329-.023.65-.067.964zM15.83 9.665c2.926 0 5.097 1.424 6.098 3.528h-10.82V9.666h4.72z" fill="#FFF"/>
    </g>`,
  eth: `
    <g fill="none" fill-rule="evenodd">
      <circle cx="16" cy="16" r="16" fill="#627EEA"/>
      <g fill="#FFF" fill-rule="nonzero">
        <path fill-opacity=".602" d="M16.498 4v8.87l7.497 3.35z"/>
        <path d="M16.498 4L9 16.22l7.498-3.35z"/>
        <path fill-opacity=".602" d="M16.498 21.968v6.027L24 17.616z"/>
        <path d="M16.498 27.995v-6.028L9 17.616z"/>
        <path fill-opacity=".2" d="M16.498 20.573l7.497-4.353-7.497-3.348z"/>
        <path fill-opacity=".602" d="M9 16.22l7.498 4.353v-7.701z"/>
      </g>
    </g>`,
  tusd: `
    <g fill="none">
      <circle cx="16" cy="16" r="16" fill="#2B2E7F"/>
      <g fill="#FFF">
        <path d="M17.057 19.028v-5.86h.77c2.545 0 3.172-2.373 3.172-2.373h-6.683c-3.172 0-3.71 2.374-3.71 2.374h3.943v8.817s2.508-.753 2.508-2.958z"/><path d="M24.395 23.594c2.248-2.336 3.11-5.58 2.301-8.683a9.339 9.339 0 00-2.48-4.28c-.108-.106-.216-.214-.342-.32l-.108-.107a2.185 2.185 0 00-.234-.196l-.144-.107-.215-.16-.127-.09a4.15 4.15 0 01-.251-.178l-.163-.106a1.22 1.22 0 00-.215-.125l-.162-.107c-.072-.036-.144-.09-.216-.125l-.162-.09c-.072-.035-.144-.071-.234-.106l-.055-.018c.198.16.395.339.575.517a8.75 8.75 0 010 12.427c-4.386 4.35-11.505 4.35-15.893 0-.162-.16-.306-.32-.467-.48l-.126-.143a5.762 5.762 0 01-.27-.339 11.856 11.856 0 002.176 2.995c4.584 4.546 12.026 4.546 16.61 0a.614.614 0 00.202-.18z"/><path d="M10.4 22.386a8.168 8.168 0 01-.576-.517 8.758 8.758 0 010-12.439c4.391-4.354 11.516-4.354 15.907 0 .306.304.593.625.863.964a11.784 11.784 0 00-2.177-2.98c-4.588-4.551-12.038-4.551-16.626 0-.054.053-.108.125-.18.178-3.041 3.177-3.455 7.924-1.025 11.529.954 1.39 2.284 2.55 3.814 3.265z"/>
      </g>
    </g>`,
  usdc: `
    <g fill="none">
      <circle fill="#3E73C4" cx="16" cy="16" r="16"/>
      <g fill="#FFF">
        <path d="M20.022 18.124c0-2.124-1.28-2.852-3.84-3.156-1.828-.243-2.193-.728-2.193-1.578 0-.85.61-1.396 1.828-1.396 1.097 0 1.707.364 2.011 1.275a.458.458 0 00.427.303h.975a.416.416 0 00.427-.425v-.06a3.04 3.04 0 00-2.743-2.489V9.142c0-.243-.183-.425-.487-.486h-.915c-.243 0-.426.182-.487.486v1.396c-1.829.242-2.986 1.456-2.986 2.974 0 2.002 1.218 2.791 3.778 3.095 1.707.303 2.255.668 2.255 1.639 0 .97-.853 1.638-2.011 1.638-1.585 0-2.133-.667-2.316-1.578-.06-.242-.244-.364-.427-.364h-1.036a.416.416 0 00-.426.425v.06c.243 1.518 1.219 2.61 3.23 2.914v1.457c0 .242.183.425.487.485h.915c.243 0 .426-.182.487-.485V21.34c1.829-.303 3.047-1.578 3.047-3.217z"/><path d="M12.892 24.497c-4.754-1.7-7.192-6.98-5.424-11.653.914-2.55 2.925-4.491 5.424-5.402.244-.121.365-.303.365-.607v-.85c0-.242-.121-.424-.365-.485-.061 0-.183 0-.244.06a10.895 10.895 0 00-7.13 13.717c1.096 3.4 3.717 6.01 7.13 7.102.244.121.488 0 .548-.243.061-.06.061-.122.061-.243v-.85c0-.182-.182-.424-.365-.546zm6.46-18.936c-.244-.122-.488 0-.548.242-.061.061-.061.122-.061.243v.85c0 .243.182.485.365.607 4.754 1.7 7.192 6.98 5.424 11.653-.914 2.55-2.925 4.491-5.424 5.402-.244.121-.365.303-.365.607v.85c0 .242.121.424.365.485.061 0 .183 0 .244-.06a10.895 10.895 0 007.13-13.717c-1.096-3.46-3.778-6.07-7.13-7.162z"/>
      </g>
    </g>`,
};
