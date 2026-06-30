<script>
</script>

<div class="fixed w-full h-full background-gradient">
    <div class="floating absolute rounded-full size-26 left-1/12 top-1/5" style="background: rgba(183,153,255,0.28); filter: blur(24px);"></div>
    <div class="floating absolute rounded-full size-6 float-right right-1/6 top-4/9" style="background: #b5d6e1; filter: blur(12px);"></div>
    <div class="floating absolute rounded-full size-21 left-1/6 top-6/9"
         style="background: #eee7ff; filter: blur(15.5px);"
    ></div>
</div>

<style>
    .background-gradient {
        background: linear-gradient(148deg, #ffffff 0%, #f8fff8 44.29%, #f6e4ff 100%);
        view-transition-name: background;
    }

    .floating:nth-child(1) { animation-delay: 0s; }
    .floating:nth-child(2) { animation-delay: -0.5s; }

    .floating {
        display: inline-block;
        animation: float 5s ease-in-out infinite;
    }

    @keyframes float {
      0% {
          transform: translateY(0);
      }
      50% {
          transform: translateY(-28px);
      }
      100% {
          transform: translateY(0);
      }
    }
</style>
