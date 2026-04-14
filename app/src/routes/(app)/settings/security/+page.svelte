<script lang="ts">
    enum SessionDeviceType {
        MOBILE,
        COMPUTER
    }

    const SessionDeviceTypeName = {
        [SessionDeviceType.MOBILE]: "Mobile",
        [SessionDeviceType.COMPUTER]: "Computer",
    }

    enum SessionFrontendType {
        WEBSITE,
        APP,
    }

    const SessionFrontendTypeName = {
        [SessionFrontendType.WEBSITE]: "Website",
        [SessionFrontendType.APP]: "App",
    }

    class Session {
        deviceType: SessionDeviceType
        frontendType: SessionFrontendType
        creationDate: Date
        lastActivityDate: Date

        constructor(deviceType: SessionDeviceType, frontendType: SessionFrontendType, creationDate: Date, lastActivityDate: Date) {
            this.deviceType = deviceType
            this.frontendType = frontendType
            this.creationDate = creationDate
            this.lastActivityDate = lastActivityDate
        }
    }
    let sessions = [] as Session[]
</script>
<p>Security</p>
<p>Sessions – devices you are currently logged in</p>
<ul>
    {#each sessions as session}
        <li>{SessionFrontendTypeName[session.deviceType]}</li>
    {/each}
</ul>
